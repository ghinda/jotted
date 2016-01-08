/* GridLayout support for IE8+
 *
 * IE8 does not pass the correct cell height to grids
 * nested inside table-rows.
 * IE9+ does not pass the correct cell height to child elements.
 */
(function() {
  "use strict";
  var setGridSizeTimer;
  // getBoundingClientRect width/height with IE8 support
  var getBoundingClientRect = function() {
    if (!("TextRectangle" in window)) {
      return window.Element.prototype.getBoundingClientRect;
    }
    return function() {
      var clientRect = this.getBoundingClientRect();
      var dimensions = {};
      dimensions.width = clientRect.right - clientRect.left;
      dimensions.height = clientRect.bottom - clientRect.top;
      return dimensions;
    };
  }();
  // addEventListener with IE8 support
  var addEventListener = function() {
    if ("addEventListener" in window.Element.prototype) {
      return function(type, listener) {
        this.addEventListener(type, listener, false);
      };
    }
    return function(type, listener) {
      this.attachEvent("on" + type, listener);
    };
  }();
  var bounceSetGridSizes = function(e) {
    if (setGridSizeTimer) {
      clearTimeout(setGridSizeTimer);
    }
    // IE8 needs a while to finish up the layout
    setGridSizeTimer = setTimeout(setGridSizes, 300);
  };
  // set the correct grid and scrollview sizes
  var setGridSizes = function() {
    var cellSelector = "" + ".gl-cell > .gl-vertical," + ".gl-cell > .gl-fill," + ".gl-cell > .gl-scrollview," + ".gl-cell > .gl-scrollview > .gl-scrollview-content";
    var $cells = document.querySelectorAll(cellSelector);
    var i;
    var $parent;
    var cell;
    var parent;
    for (i = 0; i < $cells.length; i++) {
      cell = getBoundingClientRect.call($cells[i]);
      $parent = $cells[i].parentNode;
      parent = getBoundingClientRect.call($parent);
      var parentDisplay;
      if ($parent.currentStyle) {
        parentDisplay = $parent.currentStyle.display;
      } else {
        parentDisplay = window.getComputedStyle($parent).display;
      }
      // instead of checking for IE by user agent, check if
      // and the height is wrong.
      if (cell.height !== parent.height) {
        // we can't separate property read/write into separate loops,
        // for performance with reflows, because we need to have the
        // corrent dimensions set on a cell parent, once we reach a child.
        $cells[i].style.height = parent.height + "px";
        // some rows without dimensions set take up more space than needed.
        if (parentDisplay === "table-row") {
          $parent.style.height = parent.height + "px";
        }
      }
    }
  };
  var gridlayoutLoaded = false;
  var domReady = function(e) {
    if (gridlayoutLoaded === false && (document.readyState === "interactive" || document.readyState === "complete")) {
      gridlayoutLoaded = true;
      bounceSetGridSizes();
      // we have to bind the events even if the layout is not broken
      // to support dom manipulation
      // (eg. client-side templating, the layout will be broken in the future).
      // page resize
      addEventListener.call(window, "resize", bounceSetGridSizes);
      if ("MutationEvent" in window) {
        // dom changes
        addEventListener.call(document.body, "DOMSubtreeModified", bounceSetGridSizes);
      } else {
        // IE8 dom changes
        addEventListener.call(document.body, "propertychange", bounceSetGridSizes);
      }
    }
  };
  // in case the dom is already ready
  domReady();
  // DOMContentLoaded with IE8 support
  addEventListener.call(document, "readystatechange", domReady);
})();