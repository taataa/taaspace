//
// SpaceElement
//
// A HTMLElement [1] in the space.
//
// [1] https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
//
var AbstractRectangle = require('./AbstractRectangle')
var extend = require('extend')

var SpaceHTML = function (html) {
  // Parameters
  //   html
  //     a string or DOMHTMLElement or t-instance.
  //

  var el = html
  if (typeof html === 'string') {
    el = new document.createElement('div')
    el.innerHTML = html
  } else if (html instanceof HTMLElement) {
    el = html
  }

  AbstractRectangle.call(this, el)

  this.setParent(t.el.parentElement)
}

var p = extend({}, AbstractRectangle.prototype)
SpaceHTML.prototype = p

p.copy = function () {
  // Return a copy of the SpaceHTML.
  // The copy has similar HTML content and size but no parent.
  //
  var h = new SpaceHTML(this.el)
  h.setSize(this.getSize())
  return h
}

p.getHTML = function () {
  return this.el.innerHTML
}

module.exports = SpaceHTML
