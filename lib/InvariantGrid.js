//
// Immutable plane-invariant grid.
//
var InvariantTransform = require('./InvariantTransform')
var Grid = require('./Grid')

var InvariantGrid = function (grid, plane) {
  // Example
  //   var igrid = new taaspace.InvariantGrid(grid, plane)
  //
  // Parameters
  //   grid (optional, default to default Grid())
  //     a Grid or a plain Grid step mode object
  //   plane (optional, defaults to Space)
  //     a SpacePlane
  //       an item in space, the plane of the grid.

  if (typeof grid === 'undefined') {
    this._grid = new Grid()
  } else {
    if (!grid.hasOwnProperty('mode')) {
      // Step mode given
      grid = new Grid(grid)
    }

    if (typeof plane === 'undefined') {
      this._grid = grid
    } else {
      this._grid = grid.transform(plane.getGlobalTransform().toSpace())
    }
  }
}

var proto = InvariantGrid.prototype

proto.snap = function (pivot, itr) {
  // Parameters:
  //   pivot
  //     InvariantVector
  //   itr
  //     InvariantTransform
  //
  // Return
  //   InvariantTransform
  //     The original transformed to snap to the grid.
  //

  // Grid requires that the pivot must be given on the source plane.
  var piv = pivot.toSpace().transform(itr._tr.inverse())
  return new InvariantTransform(this._grid.snap(piv, itr._tr))
}

proto.equals = function (igrid) {
  // Return true if grids match.
  return this._grid.equals(igrid._grid)
}

proto.to = function (plane) {
  // Represent the grid on the target coordinate plane.
  //
  // Parameters
  //   plane
  //     a SpacePlane
  //
  // Return
  //   a Path
  //
  if (plane === null || plane.isRoot()) {
    return this._grid
  }

  // Transformation from space to the target plane
  var tr = plane.getGlobalTransform().toSpace().inverse()
  return this._grid.transform(tr)
}

proto.toSpace = function () {
  // Represent the grid on the space coordinate plane.
  //
  // Return
  //   a Grid.
  //
  return this._grid
}

proto.transform = function (itr) {
  // Create a new InvariantGrid by transforming this
  // by invariant transformation.
  //
  // Parameters
  //   itr
  //     an InvariantTransform
  //
  // Return
  //   an InvariantGrid
  //
  return new InvariantGrid(this._grid.transform(itr._tr))
}

module.exports = InvariantGrid