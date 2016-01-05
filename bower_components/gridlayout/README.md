[GridLayout](https://ghinda.net/gridlayout/)
============================================

[![Build Status](https://api.travis-ci.org/ghinda/gridlayout.svg)](https://travis-ci.org/ghinda/gridlayout)

Lightweight grid system for advanced horizontal and vertical web app layouts, with support for older browsers.

Installation
------------

```
npm install gridlayout
```

or

```
bower install gridlayout
```

Why use GridLayout?
-------------------

If you need to create complex app layouts, similar to native ones, with support for older browsers.

GridLayout is a ~1 KB (minified and gzipped) CSS file and a ~0.5 KB JavaScript file used only for Internet Explorer support.

If you just support modern browsers, you’re probably better off using Flexbox.

Features
--------

* **Responsive:** Mobile first and adapts to two other breakpoints.
* **Familiar markup:** Class naming similar to the Bootstrap grid.
* **Vertical grids:** Take up the entire height of the container and split it.
* **Vertical alignment:** Align cell content vertically with just a class.
* **Scrollview:** Scroll the content inside one of the grid cells.

Browser support
---------------

* IE 8+
* iOS 5+
* Android 3+
* Modern browsers

Browsers that support the overall grid, but not the scrollview:

* Opera Mini
* iOS 4
* Android 2

**Note:**

For overall IE support you have to include the `gridlayout-ie.js` script.

For IE8, also include [Respond.js](https://github.com/scottjehl/Respond), because the grid is mobile-first.

How to use
----------

### Basic layouts

GridLayout is built using `display: table`, so you don't have to specify an exact cell size.

If you don't set cell sizes, they will be evenly sized.

```
<div class="gl">
  <div class="gl-cell">...</div>
  <div class="gl-cell">...</div>
</div>
```

### Vertical layout

You can also do vertical layouts, using the `gl-vertical` class on the grid container.

Vertical layouts will take up the entire height of their container.

```
<div class="gl gl-vertical">
  <div class="gl-cell">...</div>
  <div class="gl-cell">...</div>
</div>
```

### Media queries

The breakpoints used in GridLayout are:

* **Small (sm):** all screen sizes.
* **Medium (md):** any screen 640px or wider.
* **Large (lg):** any screen 1024px or wider.

By default, the grid will show up on **medium**(640px or wider) screens.

If you want the grid to show up on any screen size, use the `gl-sm` class.

```
<div class="gl gl-sm">
  ...
```

### Column sizing

GridLayout provides a 12-column grid that you can use on both horizontal and vertical grids.

On horizontal grids the size is the width, while on vertical grids the size is the cell height.

The class names contain the media query breakpoint and the size.

* Use `gl-sm-1` through `gl-sm-12` to size cells on any screen size. If you want the cells to show up small screens, make sure the grid container has the `gl-sm` class.
* Use `gl-md-1` through `gl-md-12` for cell sizes on medium screens.
* Use `gl-lg-1` through `gl-lg-12` for cell sizes on large screens.

```
<div class="gl">
  <div class="gl-cell gl-md-4 gl-lg-2">...</div>
  <div class="gl-cell gl-md-8 gl-lg-10">...</div>
</div>
```

You can also manually set a cell size with CSS, and the other cells without a size set will automatically resize.

### Nesting

You can easily nest grids, just make sure you include the `gl` grid container.

```
<div class="gl gl-vertical">
  <div class="gl-cell">

    <div class="gl">
      <div class="gl-cell">...</div>
      <div class="gl-cell">...</div>
    </div>

  </div>
  <div class="gl-cell">...</div>
</div>  
```

To make a grid to take up the full height of its container, use the `gl-fill` class.

```
<div class="gl gl-vertical">
  <div class="gl-cell">

    <div class="gl gl-fill">
    ...
```

### Scrollviews

By default, the cells will expand to fit their contents.

To have fixed cell sizes, and have the content scroll, you can use the scrollview.

Because of cross-browser concerns, the scrollview requires two containers.

```
<div class="gl">
  <div class="gl-cell">

    <div class="gl-scrollview">
      <div class="gl-scrollview-content">
      ...
      </div>
    </div>

  </div>
</div>
```

### Full height children

To have a full-height child element in a `gl-cell` without using a scrollview (eg. as with sticky footers) use the `gl-fill` class, instead of `height: 100%`, on the child element.

This helps the IE support script find your element and size it correctly, because IE doesn't pass the correct height to `gl-cell` children.

Because of Firefox issues with passing height to child elements without having a specific height set on the parent, you also have to use the `gl-fill` class on the parent `gl-cell`.

```
<div class="gl">
  <div class="gl-cell gl-fill">

    <div class="gl-fill">
      Full Cell Height Container
    </div>

  </div>
</div>
```

### Vertically aligning content

You can align content vertically inside cells using the `gl-align-middle` and `gl-align-bottom` classes.

```
<div class="gl">
  <div class="gl-cell gl-align-middle">...</div>
  <div class="gl-cell gl-align-bottom">...</div>
</div>
```


Examples
--------

* [Simple Layout](https://ghinda.net/gridlayout/demos/simple.html)
* [Sticky Footer](https://ghinda.net/gridlayout/demos/sticky.html)
* [Holy Grail Layout](https://ghinda.net/gridlayout/demos/holy.html)
* [Email App](https://ghinda.net/gridlayout/demos/mail.html)

License
-------

GridLayout is licensed under the [MIT license](LICENSE).
