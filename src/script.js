/* script tag runner
 */

import * as util from './util.js'

/* re-insert script tags
 */
function insertScript (frameWindow, $script, callback = function () {}) {
  var s = document.createElement('script')
  s.type = 'text/javascript'
  if ($script.src) {
    s.onload = () => {
      // use the timeout trick to make sure the script is garbage collected,
      // when the iframe is destroyed.
      // sometimes when loading large files (eg. babel.js)
      // and a change is triggered,
      // the seq runner skips loading jotted.js, and runs the inline script
      // causing a `Jotted is undefined` error.
      setTimeout(callback)
    }
    s.onerror = callback
    s.src = $script.src
  } else {
    s.textContent = $script.textContent
  }

  // re-insert the script tag so it executes.
  frameWindow.document.body.appendChild(s)

  // clean-up
  $script.parentNode.removeChild($script)

  // run the callback immediately for inline scripts
  if (!$script.src) {
    callback()
  }
}

// re-trigger DOMContentLoaded after the scripts finish loading
// because that's the browser behaviour, and some loaded scripts could rely on it
// (eg. babel browser.js)
function scriptsDone (frameWindow) {
  return function () {
    var DOMContentLoadedEvent = document.createEvent('Event')
    DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true)
    frameWindow.document.dispatchEvent(DOMContentLoadedEvent)
  }
}

// https://developer.mozilla.org/en/docs/Web/HTML/Element/script
var runScriptTypes = [
  'text/javascript',
  'text/ecmascript',
  'application/javascript',
  'application/ecmascript'
]

export default function runScripts () {
  // get scripts tags from content added with innerhtml
  var frameWindow = this._get('$resultFrame').contentWindow
  var $scripts = frameWindow.document.body.querySelectorAll('script')
  var l = $scripts.length
  var runList = []
  var typeAttr

  for (let i = 0; i < l; i++) {
    typeAttr = $scripts[i].getAttribute('type')

    // only run script tags without type attribute
    // or with a standard attribute value
    if (!typeAttr || runScriptTypes.indexOf(typeAttr) !== -1) {
      runList.push((params, callback) => {
        insertScript.call(this, frameWindow, $scripts[i], callback)
      })
    }
  }

  // insert the script tags sequentially
  // so we preserve execution order
  util.seq(runList, {}, scriptsDone(frameWindow))
}
