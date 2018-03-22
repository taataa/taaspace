var Queue = function () {
  this.head = null
  this.tail = null
}

Queue.prototype.isEmpty = function () {
  return this.head === null
}

Queue.prototype.push = function (item) {
  var c = {
    item: item,
    next: null
  }

  if (this.head === null) {
    this.head = c
  } else {
    // assert this.tail !== null
    this.tail.next = c
  }

  this.tail = c
}

Queue.prototype.pop = function () {
  var c = this.head

  if (c === null) {
    return null
  }

  this.head = c.next
  if (c.next === null) {
    this.tail = null
  }
  c.next = null // break link for garbage collector
  return c.item
}

module.exports = function (opts) {
  // Agnostic breadth-first graph traversal.
  //
  // Parameters:
  //   opts
  //     root
  //       Object with a unique property idProp. The first vertex to visit.
  //     idProp
  //       name of the unique property
  //     iteratee
  //       function (v, depth). The fn is executed once for each v.
  //       The function must return a list of adjacent nodes of v.
  //
  var root, idProp, iteratee
  var q, pushed, it, v, depth, adj, i

  root = opts.root
  idProp = opts.idProp || 'id'
  iteratee = opts.iteratee

  q = new Queue()
  pushed = {}

  // First
  q.push({
    vertex: root,
    depth: 0
  })
  pushed[root[idProp]] = true

  while (!q.isEmpty()) {
    it = q.pop()
    v = it.vertex
    depth = it.depth
    adj = iteratee(v, depth)

    for (i = 0; i < adj.length; i += 1) {
      if (!pushed[adj[i][idProp]]) {
        // Push only non-pushed vertices into queue
        q.push({
          vertex: adj[i],
          depth: depth + 1
        })
        pushed[adj[i][idProp]] = true
      }
    }
  }
}
