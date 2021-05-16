//
// SpacePixel
// A simple rectangular object in space with size 1x1
// Created for testing purposes.
//
var AbstractRectangle = require('./AbstractRectangle')
var extend = require('extend')

var SpacePixel = function (color, parent) {
  // A 1x1 rectangle
  //
  // Parameters:
  //   color
  //     CSS color string. Optional, default '#000000'
  //   parent
  //     a AbstractNode, optional, default to null
  //
  AbstractRectangle.call(this)

  this.color = (typeof color === 'string' ? color : '#000000')
  this.setSize(1, 1)

  if (typeof parent === 'object') {
    this.setParent(parent)
  }
}

SpacePixel.prototype = extend({}, AbstractRectangle.prototype)

SpacePixel.prototype.copy = function () {
  // Return a copy of the SpacePixel.
  // The copy has the same color and size but is not attached to a parent.
  //
  var px = new SpacePixel(this.color)
  px.setSize(this.getSize())
  return px
}

SpacePixel.prototype.getColor = function () {
  return this.color
}

module.exports = SpacePixel
