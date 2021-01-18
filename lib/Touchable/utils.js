var hasProp = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

exports.extend = function (target, source) {
  // Shallow object extend.
  // Return a new object where keys and values of the source
  // are merged with or replaced by target's keys and values.
  //
  var k
  var obj = {}
  for (k in target) {
    if (hasProp(target, k)) {
      obj[k] = target[k]
    }
  }
  for (k in source) {
    if (hasProp(source, k)) {
      obj[k] = source[k]
    }
  }
  return obj
}

exports.convertToTransformationType = function (opts) {
  // Converts transformation mode object to transformation type string.
  //
  // Parameters:
  //   opts: alternative properties
  //
  // TODO get rid of this complexity and use Nudged strings instead.
  //
  if (opts.translate) {
    if (opts.pivot) {
      if (opts.scale) {
        if (opts.rotate) {
          return 'SR'
        }
        return 'S'
      }
      // Translation with pivot, impossible to move
      return 'I'
    }
    if (typeof opts.angle === 'number') {
      // Translation along line
      return 'L'
    }
    if (opts.scale) {
      if (opts.rotate) {
        return 'TSR'
      }
      return 'TS'
    }
    if (opts.rotate) {
      return 'TR'
    }
    return 'T'
  }
  if (opts.scale) {
    if (opts.rotate) {
      return 'SR'
    }
    return 'S'
  }
  if (opts.rotate) {
    return 'R'
  }
  // else
  return 'I'
}

exports.clone = function (obj) {
  // Shallow object copy
  var k
  var res = {}

  for (k in obj) {
    if (hasProp(obj, k)) {
      res[k] = obj[k]
    }
  }

  return res
}

exports.cardinality = function (obj) {
  // Number of own properties
  var k
  var res = 0

  for (k in obj) {
    if (hasProp(obj, k)) {
      res += 1
    }
  }

  return res
}
