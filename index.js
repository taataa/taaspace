// API v4

var t = function (el) {
  var h = new t.SpaceHTML(el)
  return h
}

module.exports = t

t.geom = require('./lib/geom')
t.Space = require('./lib/Space')
t.SpaceHTML = require('./lib/SpaceHTML')
t.Touchable = require('./lib/Touchable')
t.Wheelable = require('./lib/Wheelable')
// Maybe in future:
// t.SpacePoint = require('./lib/SpacePoint')
// t.SpaceTransform = require('./lib/SpaceTransform')

t.version = require('./lib/version')
