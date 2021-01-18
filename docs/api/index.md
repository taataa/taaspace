# API Reference

Contents:
- [Module](#module)
  - [tapspace](#tapspace)
  - [tapspace.version](#tapspaceversion)
- [Items](#items)
  - [tapspace.Space](#tapspacespace)
  - [tapspace.SpaceGroup](#tapspacespacegroup)
  - [tapspace.SpaceHTML](#tapspacespacehtml)
  - [tapspace.SpaceImage](#tapspacespaceimage)
  - [tapspace.SpacePixel](#tapspacespacepixel)
- [Renderers](#renderers)
  - [tapspace.SpaceView](#tapspacespaceview)
- [Abstract Items](#abstract-items)
  - [tapspace.AbstractNode](#tapspaceabstractnode)
  - [tapspace.AbstractPlane](#tapspaceabstractplane)
  - [tapspace.AbstractRectangle](#tapspaceabstractrectangle)
- [Interaction](#interaction)
  - [tapspace.Touchable](#tapspacetouchable)
  - [tapspace.Wheelable](#tapspacewheelable)
- [Geometry](#geometry)
  - [tapspace.geom](#tapspacegeom)
  - [tapspace.geom.Grid](#tapspacegeomgrid)
  - [tapspace.geom.IGrid](#tapspacegeomigrid)
  - [tapspace.geom.Path](#tapspacegeompath)
  - [tapspace.geom.IPath](#tapspacegeomipath)
  - [tapspace.geom.Size](#tapspacegeomsize)
  - [tapspace.geom.ISize](#tapspacegeomisize)
  - [tapspace.geom.Transform](#tapspacegeomtransform)
  - [tapspace.geom.ITransform](#tapspacegeomitransform)
  - [tapspace.geom.Vector](#tapspacegeomvector)
  - [tapspace.geom.IVector](#tapspacegeomivector)
- [Other](#other)
  - [tapspace.preload](#tapspacepreload)
- [Definitions](#definitions)
  - [Hull order](#hull-order)



## Module

### tapspace

Usage:

    var tapspace = require('tapspace')

### tapspace.version

A semantic version string identical to the version in the module's `package.json`.



## Items

Items are objects that can be rendered and made interactive.


### tapspace.Space

The root for other items.

**Inherits** from `AbstractPlane`.

**Overwrites** `setParent` to throw an error if used. Effectively prevents the space to have a parent.

**Usage:**

    var space = new tapspace.Space()


### tapspace.SpaceGroup

A collection of items. `SpaceGroup` itself has no representation, only its children.

**Inherits** from `AbstractPlane`.

**Usage:**

    > var g = new tapspace.SpaceGroup(parent)
    > var px = new tapspace.SpacePixel()

**Constructor** `SpaceGroup(parent)` takes an optional parent item.

**Method** `#atMid()` returns a `Vector` to the centroid of the [convex hull](#hull-order) of the descendants.

**Method** `#copy()` returns a deep copy of `this`. The children are recursively copied. The resulting `SpaceGroup` does not have a parent.

**Method** `#getHull()` returns the convex hull as an `IPath`. The path is in the [hull order](#hull-order).


### tapspace.SpaceHTML

A rectangular item with custom HTML content. `SpaceView` represents the content as-is. Good for text, iframes, or canvas elements for example. Be careful when injecting content created by users.

**Inherits** from `AbstractRectangle`.

**Initial size** is 256 x 256.

**Usage:**

    > var h = new tapspace.SpaceHTML('<h1>Hell-o</h1>')
    > h.getHTML()
    '<h1>Hell-o</h1>'

**Constructor** `SpaceHTML(html, parent)` takes in a string and an optional parent item.

**Method** `#copy()` returns a copy of `this` with similar HTML content and size but without a parent.

**Method** `#getHTML()` returns string.


### tapspace.SpaceImage

An image item. `SpaceView` represents this with an `<img>` tag.

**Inherits** from `AbstractRectangle`.

**Initial size** equals to the dimensions of the given image.

**Usage:**

    tapspace.preload('assets/img.png', function (err, img) {
      if (err) { throw err }
      var im = new tapspace.SpaceImage(img, parent)
    })

If you know the image dimensions beforehand, you can use an image literal:

    var im = new tapspace.SpaceImage({
      src: 'assets/img.png',
      width: 320,
      height: 240
    }, parent)

**Constructor** `SpaceImage(img, parent)` takes in a [HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement) and an optional parent item. Alternatively, `img` can be an image literal. If `HTMLImageElement` is given, use [tapspace.preload](#tapspace-preload) to ensure the image has correct dimensions before constructing the `SpaceImage`.

**Method** `#copy()` returns a copy of `this` with the same image and size but without a parent.

**Method** `#getImage()` returns HTMLImageElement.


### tapspace.SpacePixel

A colored rectangular item. `SpaceView` represents this with a `<div>` styled with CSS `background` property.

**Inherits** from `AbstractRectangle`.

**Initial size** is 1x1.

**Usage:**

    > var px = new tapspace.SpacePixel('pink', parent)

**Constructor** `SpacePixel(color, parent)` takes in an optional color string and an optional parent item. The string defaults to `#000000`.

**Method** `#copy()` returns a copy of `this` with the same color and size but without a parent.

**Method** `#getColor()` returns the background property string.



## Renderers


### tapspace.SpaceView

A viewport to the `Space`. Renders the items in HTML and CSS. Positions the rendered elements with [CSS3 transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform).

**Inherits** from `AbstractRectangle`.

**Listens** events: `added`, `removed`, `transformed`, `resized`, `childAdded`, `childRemoved`

**Usage:**

    > var view = new tapspace.SpaceView(space)

**Constructor** `SpaceView(space)` takes in an optional instance of `Space`.

**Method** `#fitScale(...)` overrides `AbstractRectangle#fitScale(...)` to throw an error if the view is not mounted.

**Method** `#fitSize(...)` overrides `AbstractRectangle#fitSize(...)` to prevent resizing. See `#refreshSize()`.

**Method** `#getElementBySpaceItem(item)` returns `HTMLElement` rendered for the item in this view. Returns `null` if the item has no HTMLElement in this view.

**Method** `#getContainer()` returns the `HTMLElement` given with `#mount(htmlContainer)`. Returns `null` if the view is not mounted.

**Method** `#getSpaceItemByElementId(id)` returns an item associated with an `HTMLElement` with the given id attribute or `null` if not found.

**Method** `#isMounted()` returns `true` if the view is mounted onto a container.

**Method** `#mount(htmlContainer)` attaches the view into the given `HTMLElement`. This starts a rendering process where the items in `Space` are rendered in HTML and listened for changes.

**Method** `#refreshSize()` resizes the view to match `clientWidth` and `clientHeight` of the container element.

**Method** `#setParent(item)` overrides `AbstractNode#setParent(item)` to ensure only a `Space` is allowed for the parent.

**Method** `#setSize(...)` overrides `AbstractRectangle#setSize(...)` to prevent resizing. See `#refreshSize()`.

**Method** `#setISize(...)` overrides `AbstractRectangle#setISize(...)` to prevent resizing. See `#refreshSize()`.

**Method** `#unmount()` undoes `#mount(htmlContainer)` and clears the container.



## Abstract Items

The items inherit from their abstract prototypes. The image below gives an overview on the prototype chain.

![tapspace module dependency graph](tapspace_api_3.png?raw=true)

*Image: The module dependency graph represents the relationships between Tapspace modules. Diamond denotes composition: AbstractNode has other AbstractNodes. Arrow head denotes inheritance: AbstractRectangle is an AbstractPlane, AbstractPlane is an AbstractNode et cetera.*

### tapspace.AbstractNode

Gives an inheriting object the tree node capabilities like fetching the children and ancestor nodes.

**Inherits** from `Emitter`. See API details at [component-emitter](https://www.npmjs.com/package/component-emitter).

**Emits** `added` when attached to a new parent. Has payload `{ source: <AbstractNode>, newParent: <AbstractNode>, oldParent: <AbstractNode> }`. If there was no old parent then `oldParent: null`.

**Emits** `removed` when detached from a parent. Has payload `{ source: <AbstractNode>, newParent: <AbstractNode>, oldParent: <AbstractNode> }`. If there is no new parent then `newParent: null`.

**Emits** `childAdded` when a child node is added. Has payload `{ source: <AbstractNode>, newChild: <AbstractNode>, oldParent: <AbstractNode> }`. If there was no old parent then `oldParent: null`.

**Emits** `childRemoved` when a child node is removed. Has payload `{ source: <AbstractNode>, oldChild: <AbstractNode>, newParent: <AbstractNode> }`. If there is no new parent then `newParent: null`.

**Method** `#addChild(item)` inserts `item` to the last child of `this`. Emits `childAdded`. The new child `item` emits `removed` if already attached and then emits `added`.

**Method** `#bringAbove(item)` removes `this` from the parent and adds `this` as the next sibling of `item`. Emits `removed` and then `added`. Parent emits `childRemoved` and `childAdded`.

**Method** `#bringToFront()` reinserts `this` as the last children (=topmost). Emits `removed` and then `added`. Parent emits `childRemoved` and `childAdded`.

**Method** `#emit(eventName, arg1, arg2, ...)` emits an event. See [component-emitter](https://www.npmjs.com/package/component-emitter).

**Method** `#getAncestors()` returns an array of items, the parent at `[0]`, the parent's parent at `[1]`, et cetera.

**Method** `#getChildren()` returns an array of items.

**Method** `#getDescendants()` returns an array of items, including children, the childrens' children, et cetera.

**Method** `#getFirstChild()` returns the first (bottommost) child.

**Method** `#getLastChild()` returns the last (topmost) child.

**Method** `#getNextSibling()` returns the next (higher) child of the parent.

**Method** `#getParent()` returns the parent item and `null` if no parent.

**Method** `#getPreviousSibling()` returns the previous (lower) child of the parent.

**Method** `#getRootParent()` returns the most distant ancestor, the one without a parent.

**Method** `#hasChild(item)` returns `true` if `item` is a child of `this`.

**Method** `#hasDescendant(item)` returns `true` if `this` an ancestor of `item`.

**Method** `#isRoot()` return `true` if `this` has no parent.

**Method** `#off(eventName, handlerFn)` removes the event handler. See [component-emitter](https://www.npmjs.com/package/component-emitter).

**Method** `#on(eventName, handlerFn)` registers an event handler. See [component-emitter](https://www.npmjs.com/package/component-emitter).

**Method** `#remove()` detaches `this` from the parent.

**Method** `#sendBelow(item)` removes `this` from the old parent and adds `this` as the previous sibling of `item`. Emits `removed` and then `added`. Parent emits `childRemoved` and `childAdded`.

**Method** `#sendToBack()` reinserts `this` as the first children (=bottommost).  Emits `removed` and then `added`. Parent emits `childRemoved` and `childAdded`.

**Method** `#setParent(item)` removes `this` from the current parent and attaches it as a child of `item`. Emits `removed` if there was a parent and then emits `added`. The old parent emits `childRemoved` and the new parent emits `childAdded`.



### tapspace.AbstractPlane

Gives an inheriting object capabilities to act as a coordinate plane. Each AbstractPlane has a `Transform` that defines the position of the plane in relation to its parent plane. `Transform` is a transformation matrix that allows rotations, scalings, and translations. The matrix maps a vector on the plane to another vector on the parent plane.

**Inherits** from `AbstractNode`.

**Listens** event `removed` to ensure a root element has no transformation.

**Emits** `transformed` with a payload `{ source: <AbstractPlane>, newTransform: <Transform>, oldTransform: <Transform> }` that tells what was transformed and how much.

**Method** `#at(x, y)` or `#at(vector)` returns an `IVector` at the position (x, y) on `this`.

**Method** `#getGlobalTransform()` returns an `Transform`, the total transformation from `this` to the root's coordinate system.

**Method** `#getGlobalITransform()` returns an `ITransform`, a plane-invariant version of the total transformation from `this` to the root's coordinate system.

**Method** `#getLocalTransform()` returns a `Transform`, the coordinate mapping from `this` to the parent plane.

**Method** `#getLocalITransform()` returns an `ITransform`, a plane-invariant version of the local transform. Where `#getLocalTransform` tells the effect of the plane's local transformation in the parent's coordinate system, `#getLocalITransform` tells the local effect in the global scope.

**Method** `#resetTransform()` is a shortcut for `#setLocalTransform(Transform.IDENTITY)`. Emits `transformed`.

**Method** `#setGlobalTransform(tr)` takes a `Transform` and updates the local transformation so that the global transformation becomes equal to `tr`. Emits `transformed`.

**Method** `#setGlobalITransform(itr)` takes a `ITransform` and updates the local transformation so that the global transformation becomes equal to `tr`. Emits `transformed`.

**Method** `#setLocalTransform(tr)` takes a `Transform` and replaces the local transformation. Emits `transformed`.

**Method** `#setLocalITransform(itr)` takes a `ITransform` and replaces the local transformation. Emits `transformed`.

**Method** `#snap(pivot, igrid)` updates the local transformation so that the given pivot `IVector` snaps to the given `IGrid`. Emits `transformed`.

**Method** `#transformBy(tr)` takes a `Transform` or `ITransform` and multiplies the local transformation matrix from the left. For example, if a plane is already rotated by 45 degrees then `#transformBy(rotate90)` rotates the plane 90 degrees, thus setting the total rotation to 135 degrees. Emits `transformed`.

**Method** `#translate(domain, range)` moves `this` horizontally and vertically so that the given domain (an array of `IVector`s) travels as close to the range (a matching length array of `IVector`s) as possible. If only single `IVector`s are given, the array can be omitted. Emits `transformed`.

**Method** `#scale(pivot, multiplier)` or `#scale(pivot, domain, range)` scales `this` around the `IVector pivot`. A `multiplier` of `2` would double the dimensions of `this` on the parent plane. If `domain` and `range` are given, `this` becomes scaled so that domain becomes as close to range as possible, like described at `#translate`. Emits `transformed`.

**Method** `#rotate(pivot, radians)` or `#rotate(pivot, domain, range)` is similar to `#scale` but rotates instead of scaling.

**Method** `translateScale(domain, range)` is similar to `#scale` but allows both translation and scaling.

**Method** `translateRotate(domain, range)` is similar to `#scale` but allows both translation and rotation.

**Method** `scaleRotate(pivot, domain, range)` is similar to `#scale` but allows both scaling and rotation around a `IVector pivot`.

**Method** `translateScaleRotate(domain, range)` is similar to `#scale` but allows each translation, scaling, and rotation.

**Experimental Method** `setLocal3d(pivot, vec3)` can be used to place objects with 3D coordinates. The method takes a `Vector` vanishing point and a literal 3D point `{ x, y, z }`. The `z` property acts as a distance i.e. a perspective scaling factor towards the vanishing point. The `x` and `y` properties describe translation at the distance `z`. The method replaces the local transformation with a translate-scale transformation.



### tapspace.AbstractRectangle

Gives an inheriting object a rectangular shape and size dimensions.

**Inherits** from `AbstractPlane`.

**Emits** `resized` with a payload `{ source: <AbstractRectangle>, newSize: <Size>, oldSize: <Size> }`.

**Method** `#atNorm(x, y)` returns `IVector` from a point relative to the rectangle dimensions. For example `#atNorm(0, 1)` gives the bottom-left corner and `#atNorm(0.5, 0.5)` gives the middle point.

**Method** `#atMid()` is alias for `#atNorm(0.5, 0.5)`.

**Method** `#atMidN()` is alias for `#atNorm(0.5, 0)`.

**Method** `#atMidW()` is alias for `#atNorm(0, 0.5)`.

**Method** `#atMidE()` is alias for `#atNorm(1, 0.5)`.

**Method** `#atMidS()` is alias for `#atNorm(0.5, 1)`.

**Method** `#atNW()` is alias for `#atNorm(0, 0)`.

**Method** `#atNE()` is alias for `#atNorm(1, 0)`.

**Method** `#atSW()` is alias for `#atNorm(0, 1)`.

**Method** `#atSE()` is alias for `#atNorm(1, 1)`.

**Method** `#fitScale(ipath)` translates and scales `this` so that the rectangle encloses the given `IPath` precisely. The local size is not altered. Emits `transformed`.

**Method** `#fitSize(ipath)` translates and resizes `this` so that the rectangle encloses the given `IPath` precisely. The local size and the width-height ratio is probably altered. Emits `transformed` and `resized`.

**Method** `#getHull()` returns `IPath` that consists of the corners of the rectangle in counter-clockwise order i.e. the [hull order](#hull-order).

**Method** `#getSize()` return `Size`, representing the dimensions in the local coordinates.

**Method** `#getISize()` return `ISize`, representing the dimensions in plane-invariant manner.

**Method** `#setSize(size)` updates the local size to match the given `Size`. Emits `resized`. Alternatively, use `#setSize(width, height)`.

**Method** `#setISize(isize)` updates the local size to match the given `ISize`. Emits `resized`.



## Interaction

These input managers map events from input devices to manipulations of items in space.


### tapspace.Touchable

To allow users to directly interact with the items, make the items touchable. `Touchable` is an input manager that maps touch and mouse events on HTML to a transformation and applies the transformation to a given item.

**Usage:**

    > var tou = new tapspace.Touchable(view, item);

**Constructor** `Touchable(view, item)` takes in the parameters:

- *view:* a mounted instance of `SpaceView`. Only the gestures made on this view will be listened and recognized.
- *item:* an instance of `AbstractPlane` such as `SpaceHTML`, `SpacePixel`, `SpaceGroup`, or `SpaceView`. Only gestures made on the HTML representation of the `item` are listened and recognized. The `item` reacts to the manipulations as specified by the mode. The view must have rendered an element for the `item` or otherwise an error is thrown.
- *targetItem:* optional `function` or a target instance of `AbstractPlane`. If specified, the recognized transformations are applied to this `targetItem` instead of `item`. This way you can for example implement a drag or rotation handles for a larger item. If a function was given instead of an item, it is called each time a transformation is recognized and ready to be applied. The function is given a `ITransform` as the first argument.

**Methods:**

- *start(mode):* enables the interaction in the given mode. If no mode is given, the default mode is used. Can be called again to update the mode.
- *restart(mode):* alias of `start(mode)` but can make the code more readable when actually updating the mode instead of `start`.
- *stop():* disables the interaction. No events are fired or events listened anymore. Forgets the mode.
- *resume():* starts the manager with the last known mode.

**Mode:**

The mode object defines the allowed types of manipulation. Some types are not possible together so a type can override another. The full list of the mode properties and their conflicts is given below.

- *translate:* set `true` to allow horizontal and vertical movement. Default is `false`. If `pivot` is specified the value of `translate` has no effect. If `angle` is specified the translation will occur only along a line at that angle.
- *rotate:* set `true` to allow rotation. If `translate: false` and `pivot` is not specified the rotation is allowed only around the center of the item. Default is `false`.
- *scale:* set `true` to allow scaling. If `translate: false` and `pivot` is not specified the scaling is allowed only around the center of the item. Default is `false`.
- *pivot:* set to a `IVector` to specify a pivot for rotation and scaling. If `pivot` is specified the value of `translate` has no effect. Default is `null`.
- *angle:* set to a `number` in radians to limit translation to occur only at the given angle.
- *tap:* set to `true` to allow emitting of `tap` event. Default is `false`.
- *tapMaxTravel:*  Default is 20.
- *preventDefault:* set `true` to cancel handled touch and mouse events. Set `false` to let `Touchable` managers higher in the DOM also handle the events. Default is `true`. **Warning:** The default value will change in v2 to `false`. Therefore to make your app forward compatible, always specify `preventDefault`.

The default mode is accessible at `Touchable.DEFAULT_MODE`.

**Events:**

The manager emits the following events:

- *gesturestart:* fired at the beginning of the gesture when the first pointer lands on the element.
- *gesturemove:* fired when a pointer on the element moves so that the transformation changes.
- *gestureend:* fired when the last pointer is lifted off from the element.
- *tap:* fired if all the following statements are true: 1) mode has `tap: true`, 2) last finger or other pointer was lifted from the element, and 3) pointers did not move during the gesture more in average than what is allowed by a threshold value. The default threshold of `20` can be overridden by an additional mode property `tapMaxTravel`.

The events are fired with an event object. The event object has the following properties:

- *distance:* a number. An average manhattan distance in screen pixels that a pointer has traveled after `gesturestart`.
- *duration:* a number. Milliseconds from the `gesturestart`
- *element:* a `HTMLElement`. The source of the original pointer events.
- *item:* an `AbstractPlane`. The item of the HTMLElement.
- *points:* available only for `tap` event. A list of `IVector`s that give the locations where the pointers touched the space. Consider using `IVector.mean` to combine them.


### tapspace.Wheelable

To manipulate items and views with mouse wheel make them *wheelable*.
The `Wheelable` is an input manager that maps [`WheelEvent`](https://developer.mozilla.org/en-US/docs/Web/Events/wheel) to item manipulations, for example to zoom a view.

**Usage:**

    > var wheel = new tapspace.Wheelable(view, item)
    > wheel.start({ scale: true })

**Constructor** `Wheelable(view, item, targetItem)` takes in a `SpaceView` where the interaction happens and an `item`, an instance of `AbstractPlane` to transform. The `view` must have rendered an element for the `item` or otherwise an error is thrown. An optional `targetItem` can be a `function` or an instance of `AbstractPlane` and is used as an alternative target for recognized transformation. If a `targetItem` is a function, it receives a `ITransform` as the first argument and is called each time an item would have been transformed.

**Methods** are identical to [tapspace.Touchable](#tapspacetouchable) with the exception of mode properties and emitted events defined below.

**Mode** object defines the allowed types of manipulation. Some types collide in the way they interpret events and can thus override each other. The full list of the mode properties and their conflicts is given below.

- `scale`: set `true` to allow scaling around the mouse pointer. Default is `false`.
- `translate`: set `true` to allow horizontal and vertical scroll. Default is `false`. If also `scale: true` then only horizontal scroll is enabled as the vertical wheel spin goes to scaling (`deltaY` property of `WheelEvent`).
- `rotate`: set `true` to allow rotation around the mouse pointer. Default is `false`. Enabled only for 3D mouses (devices that use `deltaZ` property of `WheelEvent`).
- `endInterval`: a `number` of milliseconds to wait for a `wheel` event before emitting `gestureend`. Default is `200`.

The default mode is accessible at `Wheelable.DEFAULT_MODE`.

**Events** are emitted to allow the app to react in additional ways.

- `gesturestart` is emitted at first wheel move.
- `gesturemove` is emitted at each wheel move but after `gesturestart` and before `gestureend`.
- `gestureend` is emitted `endInterval` milliseconds after the last wheel move.
- `wheel` is emitted at each wheel move. Deprecated in v2, use `gesturemove` instead.

The events are fired with an event object having the following properties:

- `element`: an `HTMLElement`. The source of the original `wheel` event.
- `item`: an `AbstractPlane`. The item that was transformed.
- `originalEvent`: the original `wheel` event



## Geometry


### tapspace.geom

A collection of geometric models. All models under `geom` are *immutable* i.e. their state does not change. For example, `vector.rotate(Math.PI)` does not change `vector` but instead returns a new, rotated `Vector` instance.


### tapspace.geom.Grid

A `Grid` is a tool to round transformations to their closest alternatives allowed by the grid. In other words, you can snap items to discrete positions. In addition to xy-lattice, you can also snap scales and rotations.

**Usage:**

    > var grid = new tapspace.geom.Grid(mode)
    > var snappedTr = grid.snap(space.at(0,0), transform)

**Mode** is an object that defines the grid. Following properties are available:
- `xStep`: eye size to x direction.
- `xPhase`: grid's origin in x direction.
- `xRotation`: rotation of x direction (defaults to 0)
- `yStep`: eye size to y direction.
- `yPhase`: grid's origin in y direction.
- `yRotation`: rotation of y direction (defaults to PI/2)
- `scaleStep`: scale multiplier. E.g. value `2` allows scales of 2^i, like `0.5`, `1`, `2`, and `4`.
- `scalePhase`: addition to exponent. E.g. letting `scaleStep:2` and `scalePhase:0.5` allows scales of 2^(i+0.5), like `0.71`, `1.41`, and `2.83`.
- `rotateStep`: rotation step size in radians. E.g. value PI/2 allows rotations of 0, 90, 180, and 270 degrees.
- `rotatePhase`: addition to rotation. E.g. letting `rotateStep:Math.PI/2` and `rotatePhase:Math.PI/4` allows rotations of 45, 135, 225, and 315 degrees.

**Method** `#almostEqual(grid)` returns `true` if the given `Grid` is equal to `this`, allowing small errors from floating point arithmetics.

**Method** `#at(i, j)` returns `Vector` at (i, j) in grid's coordinates. E.g. let `xStep:2` and `yStep:2`, then `this.at(1, -1)` returns `Vector(2, -2)`. Also, `this.at(0, 0)` equals `this.getOrigin()`.

**Method** `#equal(grid)` returns `true` if values of the modes of the grids are strictly equal.

**Method** `#getHullOf(i, j)` returns `Path` representing the hull of (i, j):th eye of the grid. The path is in the [hull order](#hull-order).

**Method** `#getOrigin()` returns `Vector` at the grid origin, specified by `xStep`, `xPhase`, `yStep`, and `yPhase`.

**Method** `#snap(pivot, transform)` returns a snapped `Transform`. To describe, if the snapped `Transform` is then applied to the pivot, the result is a `Vector` that fulfils the restrictions of the mode. In other words, a plane defined by the transform is moved so, that the pivot on the plane hits the grid.

**Method** `#toArray` returns a serializable representation of the grid.

**Method** `#transform(tr)` returns a new transformed `Grid`. E.g. 2x scaling doubles the `xStep` and `yStep` eye sizes. This method enables us to represent a grid on different planes, paving a way for the plane invariant `IGrid`.


### tapspace.geom.IGrid

An `IGrid` is a plane-invariant grid that can be converted to plane-dependent `Grid` by calling `#to` method.

**Usage:**

    > var igrid = new tapspace.geom.IGrid(modeOrGrid, item)

**Constructor** `IGrid(modeOrGrid, item)` where `modeOrGrid` is a `Grid` mode or a `Grid` and `item` is an optional `AbstractPlane` that defines the plane of `modeOrGrid`. Default for `item` is the root.

**Method** `#almostEqual(igrid)` returns `true` if the given `IGrid` is equal to `this`, allowing small errors from floating point arithmetics.

**Method** `#at(i, j)` returns `IVector` at (i, j) in grid's coordinates. E.g. let `xStep:2` and `yStep:2`, then `this.at(1, -1)` returns `IVector` for `Vector(2, -2)`. Also, `this.at(0, 0)` equals `this.getOrigin()`.

**Method** `#equal(igrid)` returns `true` if values of the modes of the grids become strictly equal if transformed on the same plane.

**Method** `#getHullOf(i, j)` returns `IPath` representing the hull of (i, j):th eye of the grid. The path is in the [hull order](#hull-order).

**Method** `#getOrigin()` returns `IVector` at the grid origin, specified by `xStep`, `xPhase`, `yStep`, and `yPhase`.

**Method** `#snap(pivot, itransform)` returns a snapped `ITransform`. To describe, if the snapped `ITransform` is then applied to the given `IVector pivot`, the result is an `IVector` that fulfils the restrictions of the mode. In other words, a plane defined by `itransform` is moved so, that the pivot on the plane hits the grid.

**Method** `#to(item)` returns a `Grid` in the coordinate plane of the given item. The returned grid is globally equivalent to `this`.

**Method** `#toSpace()` returns a `Grid` in the coordinate system of the root item.

**Method** `#transform(itr)` returns an `IGrid`, transformed by the given `ITransform itr`. E.g. 2x scaling doubles the `xStep` and `yStep` eye sizes.


### tapspace.geom.Path

A `Path` is an ordered sequence of `Vector`s. See `IPath` for plane-invariant alternative.

**Usage:**

    var Vec = tapspace.geom.Vector
    var p = new tapspace.geom.Path([
      new Vec(x0, y0),
      new Vec(x1, y1),
      ...
    ])

**Method** `#add(path)` returns a new `Path` that is the result of concatenating `this` with the given `path`.

**Method** `#almostEqual(path)` returns `true` if each `Vector` in `this` is almost equal to similarly positioned `Vector` in the given `path`, thus leaving a room for small floating point arithmetic errors.

**Method** `#atMid()` returns the mass centroid of the closed path as a `Vector` and `null` if the path is empty.

**Method** `#bottom()` returns the `Vector` with the largest `y` property. If multiple `Vector`s share the same `y`, the first is returned.

**Method** `#equal(path)` returns `true` if each `Vector` in `this` is equal to similarly positioned `Vector` in the given `path`.

**Method** `#first()` returns the first `Vector` of the path and `null` if empty.

**Method** `#get(i)` returns the `i`:th `Vector` of the path and `undefined` if the index is out of range.

**Method** `#getBounds()` returns a bounding box as a `Path` in the [hull order](#hull-order).

**Method** `#getHull()` returns the convex hull of `this` as a `Path`. The path is in the [hull order](#hull-order).

**Method** `#last()` returns the last `Vector` of the path and `null` if empty.

**Method** `#left()` returns the `Vector` with the smallest `x` property. If multiple `Vector`s share the same `x`, the first is returned.

**Method** `#right()` returns the `Vector` with the largest `x` property. If multiple `Vector`s share the same `x`, the first is returned.

**Method** `#toArray()` returns an array of `Vector`s.

**Method** `#top()` returns the `Vector` with the smallest `y` property. If multiple `Vector`s share the same `y`, the first is returned.

**Method** `#transform(tr)` returns a new `Path` where each `Vector` has been left-multiplied by the given `Transform`.


### tapspace.geom.IPath

A `IPath` is an ordered sequence of `IVector`s and a plane-invariant alternative for `Path`.

**Usage:**

    var Vec = tapspace.geom.Vector
    var p = new tapspace.geom.Path([
      new Vec(x0, y0),
      new Vec(x1, y1),
      ...
    ])
    var ip = new tapspace.geom.IPath(p, space)

**Constructor** `IPath(path, item)` takes a `Path` and an item that defines the coordinate system of the `path`.

**Property** `#length` equals the number of `Vector`s in the path.

**Method** `#add(ipath)` returns a new `IPath` that is the result of concatenating `this` with the given `IPath`.

**Method** `#almostEqual(ipath)` returns `true` if `this` and the given `IPath` are almost equal when represented on a same coordinate system. See `Path#almostEqual`.

**Method** `#atMid()` returns the mass centroid of the closed path as a `IVector` and `null` if the path is empty.

**Method** `#equal(ipath)` returns `true` if `this` and the given `IPath` are equal when represented in a coordinate system.

**Method** `#first()` returns `IVector` for the first point on the path.

**Method** `#get(i)` returns `IVector` for the `i`:th point on the path.

**Method** `#getHull()` returns the convex hull of `this` as an `IPath`. The path is in the [hull order](#hull-order).

**Method** `#last()` returns `IVector` for the last point on the path.

**Method** `#to(item)` returns `Path` represented in the given item's coordinate system.

**Method** `#toArray()` returns an array of `IVector`s.

**Method** `#toSpace()` returns `Path` represented in the coordinate system of the root item.

**Method** `#transform(itr)` returns a new `IPath` where each `IVector` has been left-multiplied by the given `ITransform`.


### tapspace.geom.Size

An object with width and height. The `Size` does not have location or rotation and is affected only by scaling. If you need to represent a rectangular shape on multiple planes, use `IPath` instead.

**Usage:**

    var sz = new tapspace.geom.Size(8, 5)

**Property** `width` gives the width. Always zero or positive.

**Property** `height` gives the height. Always zero or positive.

**Method** `#almostEqual(sz)` returns `true` if `this` and the given `Size` are equal, by allowing a small error from floating point arithmetics.

**Method** `#equal(sz)` returns `true` if `this` and the given `Size` have strictly equal width and height.

**Method** `#getWidth()` returns the property `width`.

**Method** `#getHeight()` returns the property `height`.

**Method** `#max()` returns the largest from `width` and `height`.

**Method** `#min()` returns the smallest from `width` and `height`.

**Method** `#toArray()` returns `[<width>, <height>]`.

**Method** `#transform(tr)` returns a new `Size` where the dimensions have been scaled by the given `Transform`. The given `Transform` can have translation and rotation too but only scaling will have an effect.


### tapspace.geom.ISize

A plane-invariant size, a container of two plane-invariant measures. With `ISize` you can convert `Size` objects into other coordinate systems.

**Usage:**

    var sz = new tapspace.geom.Size(8, 5)
    var isz = new tapspace.geom.ISize(s, sourceItem)
    var sizeOnTarget = isz.to(targetItem)

**Method** `#almostEqual(isz)` returns `true` if `this` and the given `ISize` are equal, by allowing a small error from floating point arithmetics.

**Method** `#equal(isz)` returns `true` if `this` and the given `ISize` have strictly equal width and height.

**Method** `#getWidth()` returns `IScalar` representing the width in plane-invariant manner.

**Method** `#getHeight()` returns `IScalar` representing the height in plane-invariant manner.

**Method** `#to(item)` returns `Size` that is `this` represented in the given item's coordinate system.

**Method** `#toSpace()` returns `Size` in the coordinate system of the root item.


### tapspace.geom.IScalar

A plane-invariant measure.

**Usage:**

    var s = new tapspace.geom.IScalar(6, sourceItem)
    var t = s.to(targetItem)

**Method** `#add(isca)` returns a new `IScalar` that is the sum of `this` and the given `IScalar`.

**Method** `#equal(isca)` returns `true` if `this` and the given `IScalar` are globally equal.

**Method** `#multiply(x)` returns a new `IScalar` multiplied by `x`, where `x` is a `number` or `IScalar`.

**Method** `#subtract(isca)` returns a new `IScalar` that equals to `this` subtracted by `IScalar`.

**Method** `#to(item)` returns `number` that is `this` represented in the given item's coordinate system.

**Method** `#toSpace()` returns `number` in the coordinate system of the root item.


### tapspace.geom.Transform

For API, see [nudged.Transform](https://github.com/axelpale/nudged#nudgedtransforms-r-tx-ty)


### tapspace.geom.ITransform

A plane-invariant `Transform`. Similarly as a `Vector` can be represented in multiple coordinate systems,
so can a transformation. To free users from thinking about which representation is the correct one for a given situation, we have `ITransform`.

**Constructor** `ITransform(transf, plane)` takes in a `Transform` and an item (instance of `AbstractPlane`) that defines the coordinate system of the given `Transform`.

**Factory** `ITransform.estimate(type, domain, range, pivot)` returns an `ITransform` estimated from the given control points. Parameter `type` is a `string` and defines the set of allowed transformations: `'I'`, `'T'`, `'S'`, `'R'`, `'TS'`, `'TR'`, `'SR'`, or `'TSR'`. Parameters `domain` and `range` are `IPath`s or arrays of `IVector`s and are the control points for the estimation. The optional parameter `pivot` is `IVector` and restricts the transform to keep this point fixed. See package [nudged](https://www.npmjs.com/package/nudged) for details.

**Constant** `ITransform.IDENTITY` gives the default `ITransform`.

**Method** `#almostEqual(itr)` returns `true` if the elements of transformation matrices of `this` and the given `ITransform` match. Leaves a room for small floating point arithmetic error.

**Method** `#equal(itr)` returns `true` if elements in the transformation matrices are strictly equal.

**Method** `#inverse()` returns `ITransform` with the inverse of the original transformation matrix.

**Method** `#to(item)` returns a `Transform` that equals to `this` represented in the coordinate system of the given item.

**Method** `#toSpace()` returns a `Transform` that equals to `this` represented in the coordinate system of the root item.

**Method** `#multiplyRight(itr)` alias `#transformBy(itr)` returns a `ITransform` that is the original multiplied from the right with the given `ITransform`.

**Method** `#relativeTo(itr)` returns `ITransform` needed by the given `ITransform` to become `this`. In other words, if `C = A.relativeTo(B)`, then `A = C * B`.

**Method** `#translate(domain, range)` moves the *image* of `this` horizontally and vertically so that the given domain (an array of `IVector`s) travels as close to the range (a matching length array of `IVector`s) as possible. If only single `IVector`s are given, the array can be omitted.

**Method** `#scale(pivot, multiplier)` or `#scale(pivot, domain, range)` scales the *image* of `this` around the `IVector pivot`. A `multiplier` of `2` would double the space of the image. If `domain` and `range` are given, the image of `this` becomes scaled so that domain becomes as close to range as possible, like described at `#translate`.

**Method** `#rotate(pivot, radians)` or `#rotate(pivot, domain, range)` is similar to `#scale` but rotates instead of scaling.

**Method** `translateScale(domain, range)` is similar to `#scale` but allows both translation and scaling.

**Method** `translateRotate(domain, range)` is similar to `#scale` but allows both translation and rotation.

**Method** `scaleRotate(pivot, domain, range)` is similar to `#scale` but allows both scaling and rotation around a `IVector pivot`.

**Method** `translateScaleRotate(domain, range)` is similar to `#scale` but allows each translation, scaling, and rotation.


### tapspace.geom.Vector

A point in 2D space.

**Usage:**

    var vec = new tapspace.geom.Vector(2, 1)

**Property** `x` is a number

**Property** `y` is a number

**Alternative constructor** `Vector.createFromPolar(magnitude, direction)` takes the vector length and direction in radians and returns a `Vector`.

**Alternative constructor** `Vector.mean(vecList)` takes a non-empty list of Vectors and returns a `Vector` that is their arithmetic mean.

**Method** `#add(vec)` sums `this` to `vec` and returns a new `Vector`.

**Method** `#almostEqual(vec)` returns `true` if the vectors match. Leaves a room for small floating point arithmetic error.

**Method** `#changeBasis(vi, vj)` takes two `Vector`s `vi` and `vj` and returns a `Vector` represented in a coordinate system where `vi` and `vj` are the basis vectors. In other words, if `r = this.changeBasis(vi, vj)` then `this` is equal to `r.x` * `vi` + `r.y` * `vj`. Throws `Error` if given basis vectors are linearly dependent.

**Method** `#changeFromBasis(vi, vj)` is opposite of `#changeBasis` so that if `a = b.changeBasis(vi, vj)` then `b = a.changeFromBasis(vi, vj)`.

**Method** `#distance(vec)` returns Euclidean (L2) distance between `this` and `vec`.

**Method** `#equal(vec)` returns `true` if `x`s and `y`s are strictly equal.

**Method** `#getRotation()` returns radians from positive x-axis.

**Method** `#getMagnitude()` alias for `#norm`.

**Method** `#isIndependent(vec)` returns `true` if `this` and `vec` are linearly independent.

**Method** `#opposite()` returns a negation of `this`.

**Method** `#max(vec)` returns `Vector` where the largest `x` and `y` are picked from `this` and `vec`. For example, let `a = Vector(1, 0)` and `b = Vector(0, 1)` so `a.max(b)` equals `Vector(1, 1)`.

**Method** `#min(vec)` returns `Vector` where the smallest `x` and `y` are picked from `this` and `vec`. See `#max`.

**Method** `#multiply(scalar)` returns `Vector` where `x` and `y` are multiplied by `scalar`.

**Method** `#norm()` returns Euclidean (L2) norm of the vector.

**Method** `#offset(dx, dy)` returns `Vector` that is equal to `this.add(Vector(dx, dy))`.

**Method** `#polarOffset(radius, radians)` returns `Vector` that is equal to `this.add(Vector.createFromPolar(radius, radians))`.

**Method** `#rotate(radians, pivot)` returns `Vector` that has been rotated about (0, 0) or about an optional `Vector` pivot.

**Method** `#scale(factor, pivot)` returns `Vector` that has been scaled about (0, 0) or about an optional `Vector` pivot. With the default pivot (0, 0), `#scale` is essentially identical to `#multiply`.

**Method** `#subtract(vec)` returns `Vector` that is equal to `this.add(vec.opposite())`.

**Method** `#toArray()` returns `[this.x, this.y]`.

**Method** `#transform(tr)` returns `Vector` where `this` has been multiplied from left by the given `Transform`.


### tapspace.geom.IVector

A plane-invariant vector that can be converted to `Vector` on given plane when needed.

**Usage:**

    var px = new tapspace.SpacePixel('black', space)
    var v = new tapspace.geom.Vector(4, 2)
    var iv = new tapspace.geom.IVector(v, px)

**Constructor** `IVector(vec, plane)` takes a `Vector` and an item `plane`. The `plane` defines the coordinate system of `vec`.

**Alternative constructor** `IVector.mean(ivecList)` takes a non-empty list of `IVector`s and returns an `IVector` that is their mean.

**Method** `#add(ivec)` sums `this` to `IVector ivec` and returns a new `IVector`.

**Method** `#almostEqual(ivec)` returns `true` if the `IVector`s match. Leaves a room for small floating point arithmetic error.

**Method** `#distance(ivec)` returns `IScalar`, the plane invariant euclidean (L2) distance between `this` and the given `IVector`.

**Method** `#equal(ivec)` returns `true` if `this` is globally equal to the given `IVector`.

**Method** `#multiply(scalar)` returns `IVector` multiplied by `scalar`.

**Method** `#norm()` returns `IScalar` that represents the euclidean (L2) norm of the vector in plane-invariant manner.

**Method** `#offset(dx, dy, plane)` returns `IVector` that results when `this` is moved by `dx` and `dy`. Optional `plane` defines the plane of the given `dx` and `dy`. The plane defaults to the root.

**Method** `#polarOffset(radius, radians, plane)` returns `IVector` that is the result of when `this` is moved `radius` units to `radians` direction, where `radius` is a `number` or `IScalar` and `radians` is a `number`. Optional `plane` defines the coordinate system of `radians`. The `plane` defaults to the root item. The `plane` also defines the coordinate system of `radius` but is ignored if `radius` is `IScalar`.

**Method** `#to(item)` returns a `Vector` that equals to `this` represented in the coordinate system of the given item.

**Method** `#toSpace()` returns a `Vector` that equals to `this` represented in the coordinate system of the root item.

**Method** `#transform(itr)` returns an `IVector` that results when `this` is transformed by the given `ITransform itr`.



## Other

### tapspace.preload

A function to preload an image file or an array of them and call back when finished. As the main benefit, code in the callback can trust the dimensions of the image object.

**Details:** see [loadimages](https://www.npmjs.com/package/loadimages).

**Usage:**

    tapspace.preload('mylittle.png', function (err, img) {
      if (err) { throw err }
      // img is now loaded and has correct dimensions instead of 0x0.
      var si = new tapspace.SpaceImage(space, img)
    })



## Definitions

Here are detailed definitions for some terminology used above.

### Hull order

When a `Path` represents the convex hull of an item, the `Vector` points of the path have strict order. 1) The first point is the `Vector` with most negative x and y value. 2) The points after the first come in anticlockwise order. For example the convex hull of a unit square is (0,0), (0,1), (1,1), and (1,0).
