/*
Recognizer

Handles integration to Tapspace and higher level events such as tap event.

Keep all tapspace-related stuff in Recognizer.
Keep Sensor compatible with all html elements.

Notes
  [1]
    For press event detection, we can place a threshold how far
    we allow fingers to move to still classify it as a press.

*/
var Sensor = require('./Sensor')
var utils = require('./utils')
var ITransform = require('../geom/ITransform')
var IVector = require('../geom/IVector')
var Vector = require('../geom/Vector')
var nudged = require('nudged')

var hasProp = function (obj, prop) {
  return obj && Object.prototype.hasOwnProperty.call(obj, prop)
}

var toRawPivot = function (mode, plane) {
  // The pivot needs to be converted to [x, y]
  // on plane's coordinate plane.
  //
  if (mode.pivot) {
    return mode.pivot.to(plane).toArray()
  }

  // Use middle of plane as a default pivot if translation not allowed.
  if (mode.translate === false) {
    return plane
      .atMid()
      .to(plane)
      .toArray()
  }

  // Return undefined so that when rawPivot is given as a parameter
  // to Sensor, it looks like the parameter was not given.
}

var rebase = function (pointers, sourcePlane, targetPlane) {
  // Represent pointers on another AbstractPlane
  //
  // Parameters
  //   pointers
  //     a map: id -> [x, y]
  //   sourcePlane
  //     a AbstractPlane of the pointers
  //   targetPlane
  //     a AbstractPlane of the returned pointers
  //
  // Return
  //   object, a map: id -> [x, y]
  //
  if (sourcePlane === targetPlane) {
    return pointers
  }

  var k
  var result = {}
  var sourceToSpace = sourcePlane.getGlobalTransform()
  var targetToSpace = targetPlane.getGlobalTransform()
  var sourceToTarget = targetToSpace.inverse().multiplyRight(sourceToSpace)
  for (k in pointers) {
    if (hasProp(pointers, k)) {
      result[k] = sourceToTarget.transform(pointers[k])
    }
  }
  return result
}

var rebaseToSpace = function (pointers, sourcePlane) {
  var k
  var result = {}
  var sourceToSpace = sourcePlane.getGlobalTransform()
  for (k in pointers) {
    if (hasProp(pointers, k)) {
      result[k] = sourceToSpace.transform(pointers[k])
    }
  }
  return result
}

var toTapPoints = function (ps) {
  // Params:
  //   ps: map id->[x,y] on space
  var k
  var result = []
  for (k in ps) {
    if (hasProp(ps, k)) {
      result.push(new IVector(new Vector(ps[k][0], ps[k][1])))
    }
  }
  return result
}

var multiplyLeft = function (pointers, transform) {
  // Transform pointers. Regard pointers as a row vector
  // of column vectors. Multiply each column vector from left by
  // a transformation matrix.
  var k
  var result = {}
  for (k in pointers) {
    if (hasProp(pointers, k)) {
      result[k] = transform.transform(pointers[k])
    }
  }
  return result
}

var Recognizer = function (manager) {
  // Create a Recognizer
  //   var rec = new Recognizer(...)
  //
  // Parameters:
  //   manager
  //     Touchable with the following properties
  //       element
  //         HTML element to listen to
  //       item
  //         a tapspace.AbstractPlane, the object on the gesture happens
  //       targetItem
  //         a tapspace.AbstractPlane or function (ITransform itr).
  //         The object to move or a function to call.
  //       view
  //         a tapspace.SpaceView
  //       mode
  //         a transformation type
  //
  var self = this

  this.man = manager

  var startTime = null
  var totalTravel = null
  var pointersOnItem = {}
  var touchPointLog = {} // starting points

  var onStart = function (firstPointers) {
    // On gesture start. Handle the first pointer(s) of the gesture.
    //
    var sourceItem = self.man.item
    var view = self.man.view
    var el = self.man.element

    startTime = Date.now()
    totalTravel = 0

    pointersOnItem = rebase(firstPointers, view, sourceItem)

    touchPointLog = rebaseToSpace(firstPointers, view)

    self.man.emit('gesturestart', {
      distance: 0,
      duration: 0,
      element: el,
      item: self.man.targetItem
    })
  }

  var onMove = function (prevPointers, nextPointers) {
    var k, n, pivot, type, tr, itr
    var domain = []
    var range = []
    var el = self.man.element
    var view = self.man.view
    var sourceItem = self.man.item
    var targetItem = self.man.targetItem
    var mode = self.man.mode

    // Current location of new pointers on the plane.
    // This approach zeroes the effects caused by
    // 1) transformations of the view
    // 2) transformations of the parents of the source item
    var nextPointersOnItem = rebase(nextPointers, view, sourceItem)

    // Set intersection. Do not use removed or appeared pointers
    // in transformation estimation.
    for (k in pointersOnItem) {
      if (hasProp(pointersOnItem, k) && hasProp(nextPointersOnItem, k)) {
        domain.push(pointersOnItem[k])
        range.push(nextPointersOnItem[k])
      }
    }

    // Record the space locations of the new pointers to
    // provide them in the tap event.
    var viewToSpace = view.getGlobalTransform()
    for (k in nextPointersOnItem) {
      if (hasProp(nextPointersOnItem, k) && !hasProp(touchPointLog, k)) {
        // New pointer
        touchPointLog[k] = viewToSpace.transform(nextPointersOnItem[k])
      }
    }

    // Accumulate to travelled distance. See [1]
    // Use Manhattan distance for simpler computation.
    // Goal is to form a threshold to filter out small
    // involuntary movement of the fingers or arm.
    //
    // N. Divide distance by number of fingers. This way
    // an involuntary arm movement has same threshold regardless of
    // the number of touching fingers.
    //
    // Note that we compute travel on view instead of travel on
    // the plane. This way travel does not depend on transformations
    // of the space, but only the screen pixels.
    n = domain.length
    for (k in prevPointers) {
      if (hasProp(prevPointers, k) && hasProp(nextPointers, k)) {
        totalTravel += Math.abs(prevPointers[k][0] - nextPointers[k][0]) / n
        totalTravel += Math.abs(prevPointers[k][1] - nextPointers[k][1]) / n
      }
    }

    // Compute current position of the pivot on the plane.
    // Pivot will be undefined if mode has no pivot but enables translation.
    pivot = toRawPivot(mode, sourceItem)
    // Get current nudged-compatible transformation type string
    type = utils.convertToTransformationType(mode)
    // In case of translation along line, nudged.estimate needs an angle
    if (type === 'L') {
      pivot = mode.angle
    }

    // Estimate optimal transformation
    tr = nudged.estimate(type, domain, range, pivot)

    // Apply the transformation to targetItem. We also
    // memorize the new pointers for the next onMove call.
    // We want to memorize only their relative location on the source item.
    // This way transformations of the view and parents between
    // onMove calls become part of the resulting transformation.
    // Note that transformBy emits 'transformed' that might eventually
    // cause transformations in the space. Therefore we should do all
    // coordinate-plane conversions before transformBy to avoid weird bugs.

    itr = new ITransform(tr, sourceItem)

    if (typeof targetItem === 'function') {
      pointersOnItem = nextPointersOnItem
      targetItem(itr)
    } else if (view === targetItem) {
      // Somehow we do not need the following line with views:
      // pointersOnItem = multiplyLeft(nextPointersOnItem, tr)
      // If we use the line, everything shakes.
      pointersOnItem = nextPointersOnItem
      view.transformBy(itr.inverse())
    } else {
      // The sourceItem moves, but the stored pointer locations
      // should not. Thus undo the effect the transformation
      // would have to the stored pointer locations.
      pointersOnItem = multiplyLeft(nextPointersOnItem, tr.inverse())
      targetItem.transformBy(itr)
    }

    self.man.emit('gesturemove', {
      distance: totalTravel,
      duration: Date.now() - startTime,
      element: el,
      item: targetItem
    })
  }

  var onEnd = function (lastPointers) {
    // Handle the last pointer(s) of the gesture
    //
    var el = self.man.element
    var targetItem = self.man.targetItem
    var mode = self.man.mode

    self.man.emit('gestureend', {
      distance: totalTravel,
      duration: Date.now() - startTime,
      element: el,
      item: targetItem
    })

    if (mode.tap && totalTravel < mode.tapMaxTravel) {
      self.man.emit('tap', {
        distance: totalTravel,
        duration: Date.now() - startTime,
        element: el,
        item: targetItem,
        points: toTapPoints(touchPointLog)
      })
    }

    pointersOnItem = {}
    touchPointLog = {}
  }

  // Handlers defined, construct sensor
  this.sensor = new Sensor(
    this.man.element,
    {
      start: onStart,
      move: onMove,
      end: onEnd
    },
    this.man.mode
  )
}

Recognizer.prototype.update = function (mode) {
  this.sensor.update(mode)
}

Recognizer.prototype.destroy = function () {
  this.sensor.destroy()
}

module.exports = Recognizer
