/*
Plane-Invariant Transform

Similarly as a point can be represented in multiple coordinate systems,
so can a transformation. To prevent users from thinking about representations,
we have ITransform.

ITransform is a planeless representation of a transformation.
Thus, most exact name would be a coordinate-plane-invariant transformation.

*/
var Transform = require('./Transform')
var nudged = require('nudged')

var hasProp = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

// NOT YET USED ANYWHERE
// var getTrBetweenPlanes = function (sourcePlane, targetPlane) {
//   // Return a Transform that represents a mapping from sourcePlane
//   // to the targetPlane.
//   var source2space = sourcePlane.getGlobalTransform()
//   var target2space = targetPlane.getGlobalTransform()
//   return target2space.inverse().multiplyBy(source2space)
// }

var getTrOnPlane = function (tr, trToPlane) {
  // A same transformation can be represented on different coordinate systems.
  // This fn takes a transformation tr on plane A and another transformation
  // trToPlane from plane A to plane B. The result is a transformation
  // that is globally equivalent to tr but represented on plane B.
  //
  // Parameters:
  //   tr
  //     a Transform on plane A
  //   trToPlane
  //     a Transform from plane A to plane B.
  //     This is called a covariant transformation in math literature.
  //
  // Implementation note:
  //   So, the resulting transformation tr' maps a vector X' to vector Y'
  //   on plane B. The given transformation tr maps a vector X to vector Y
  //   on plane A. Therefore, the raw approach is to:
  //     1. map X' to X (= inverse of trToPlane)
  //     2. map X to Y  (= tr)
  //     3. map Y to Y' (= trToPlane)
  //   Fortunately we can combine the mappings.
  return trToPlane.multiplyBy(tr.multiplyBy(trToPlane.inverse()))
}

var ITransform = function (transf, plane) {
  // Immutable i.e. new instances are returned.
  //
  // Example
  //   var t = new tapspace.ITransform(tr, pixel)
  //
  // Parameter
  //   transf
  //     Optional. A tapspace.Transform. Default to identity transform.
  //   plane
  //     An optional AbstractPlane. Defaults to space.
  //       an item in space, gives the reference plane of transf.
  //
  // Design note:
  //   fn (transf, plane) has this parameter order to make difference
  //   to AbstractNodes' (parent, prop1, prop2, ...)

  // DEBUG
  if (plane && !('_T' in plane)) {
    throw new Error('invalid reference')
  }
  if (transf && !hasProp(transf, 'tx')) {
    throw new Error('invalid transform')
  }

  // transf is the transformation on the plane.
  if (typeof transf === 'undefined') {
    transf = Transform.IDENTITY
  }

  if (plane) {
    // Convert transformation to space
    this._tr = getTrOnPlane(transf, plane.getGlobalTransform())
  } else {
    // transf already in space
    this._tr = transf
  }
}

var proto = ITransform.prototype

proto.almostEqual = proto.almostEquals = function (gt) {
  // See Transform.almostEqual
  return this._tr.almostEqual(gt._tr)
}

proto.equal = proto.equals = function (gt) {
  // Test if given ITransform represents equivalent transformation
  // regardless of reference.
  //
  // Parameters:
  //   gt
  //     an ITransform

  return this._tr.equals(gt._tr)
}

proto.inverse = function () {
  // Return inversed transformation.
  return new ITransform(this._tr.inverse())
}

proto.to = function (plane) {
  // Represent the transform on the target coordinate plane.
  //
  // Parameters:
  //   plane: a AbstractPlane
  //
  // Return:
  //   a Transform
  //
  if (plane === null || plane.isRoot()) {
    // Is Space
    return this._tr
  }

  // Transformation from space to the target plane
  var covTr = plane.getGlobalTransform().inverse()
  return getTrOnPlane(this._tr, covTr)
}

proto.toSpace = function () {
  // Represent the transform on the space coordinate plane.
  //
  // Return a Transform.
  //
  return this._tr
}

proto.multiplyRight = proto.multiplyBy = proto.transformBy = function (itr) {
  // Transform the image of this by given ITransform.
  //
  // Parameters:
  //   itr
  //     an ITransform
  //
  return new ITransform(itr._tr.multiplyBy(this._tr))
}

proto.relativeTo = function (itr) {
  // Return an ITransform T that when multiplied from right
  // i.e. applied to itr, produces self:
  //   self = T * itr
  //  <=> T = self * inv(itr)
  //
  // Parameters:
  //   itr
  //     ITransform
  //
  return new ITransform(this._tr.multiplyBy(itr._tr.inverse()))
}

proto.translate = function (domain, range) {
  // Move transform image horizontally and vertically with control points.
  //
  // Translate so that after the translation, the domain points
  // would be as close to given range points as possible.
  //
  // Parameters:
  //   domain: array of IVector
  //   range: array of IVector
  //
  // Return:
  //   an ITransform
  //
  var itr = ITransform.estimate('T', domain, range)
  return itr.multiplyRight(this)
}

proto.scale = function (pivot, multiplierOrDomain, range) {
  // Parameters:
  //   pivot: a IVector
  //   multiplier: the scale factor, > 0
  //  OR
  //   pivot: a IVector
  //   domain: array of IVector
  //   range: array of IVector
  var useMultiplier, normPivot, domain, multiplier, tr, itr

  useMultiplier = typeof range === 'undefined'

  if (useMultiplier) {
    normPivot = pivot.toSpace().toArray()
    multiplier = multiplierOrDomain
    // Multiplier does not depend on plane.
    tr = this._tr.scaleBy(multiplier, normPivot)
    return new ITransform(tr)
  } else {
    domain = multiplierOrDomain
    itr = ITransform.estimate('S', domain, range, pivot)
    return itr.multiplyBy(this)
  }
}

proto.rotate = function (pivot, radiansOrDomain, range) {
  // Parameters:
  //   pivot: a IVector
  //   radians: rotation angle
  //  OR
  //   pivot: a IVector
  //   domain: array of IVector
  //   range: array of IVector
  var useRadians, normPivot, domain, radians, tr, itr

  useRadians = typeof range === 'undefined'

  if (useRadians) {
    normPivot = pivot.toSpace().toArray()
    radians = radiansOrDomain
    // Radians do not depend on plane.
    tr = this._tr.rotateBy(radians, normPivot)
    return new ITransform(tr)
  } else {
    domain = radiansOrDomain
    itr = ITransform.estimate('R', domain, range, pivot)
    return itr.multiplyBy(this)
  }
}

proto.translateScale = function (domain, range) {
  // Parameters:
  //   domain: array of IVector
  //   range: array of IVector
  var itr = ITransform.estimate('TS', domain, range)
  return itr.multiplyBy(this)
}

proto.translateRotate = function (domain, range) {
  // Parameters:
  //   domain: array of IVector
  //   range: array of IVector
  var itr = ITransform.estimate('TR', domain, range)
  return itr.multiplyBy(this)
}

proto.scaleRotate = function (pivot, domain, range) {
  // Parameters:
  //   pivot: IVector
  //   domain: array of IVector
  //   range: array of IVector
  var itr = ITransform.estimate('SR', domain, range, pivot)
  return itr.multiplyBy(this)
}

proto.translateScaleRotate = function (domain, range) {
  // Parameters:
  //   domain: array of IVector
  //   range: array of IVector
  var itr = ITransform.estimate('TSR', domain, range)
  return itr.multiplyBy(this)
}

// Class methods

ITransform.IDENTITY = new ITransform()

ITransform.estimate = function (type, domain, range, pivotOrAngle) {
  // Estimate ITransform from control points.
  //
  // Parameters:
  //   type: transformation type.
  //     Available types: T,L,X,Y,S,R,TS,TR,SR,TSR
  //     See nudged for further details about freedom types.
  //   domain
  //     IPath or array of IVector
  //   range
  //     IPath or array of IVector
  //   pivotOrAngle
  //     IVector, an optional pivot, used with types S,R,SR
  //     number, a mandatory angle, used with type L
  //
  var normPivot, normDomain, normRange, tr

  if (typeof pivotOrAngle !== 'undefined') {
    if (type === 'L') {
      normPivot = pivotOrAngle // angle
    } else {
      normPivot = pivotOrAngle.toSpace().toArray()
    }
  }

  // Allow singles & IPaths
  if (hasProp(domain, '_vec')) {
    domain = [domain]
  } else if (hasProp(domain, '_p')) {
    domain = domain.toArray()
  }

  if (hasProp(range, '_vec')) {
    range = [range]
  } else if (hasProp(range, '_p')) {
    range = range.toArray()
  }

  // Convert all IVectors onto the plane and to arrays
  var piv2arr = function (iv) {
    return [iv._vec.x, iv._vec.y]
  }
  normDomain = domain.map(piv2arr)
  normRange = range.map(piv2arr)

  // Then compute optimal transformation on the plane
  tr = nudged.estimate(type, normDomain, normRange, normPivot)
  return new ITransform(tr)
}

module.exports = ITransform
