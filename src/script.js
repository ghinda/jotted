/* script tag runner
 */

import * as util from './util.js'

/* re-insert script tags
 */
function insertScript ($script, callback = function () {}) {
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
    s.textContent = $script.innerText
  }

  // re-insert the script tag so it executes.
  this._get('$resultFrame').contentWindow.document.head.appendChild(s)

  // clean-up
  $script.parentNode.removeChild($script)

  // run the callback immediately for inline scripts
  if (!$script.src) {
    callback()
  }
}

export default function runScripts () {
  // get scripts tags from content added with innerhtml
  var $scripts = this._get('$resultFrame').contentWindow.document.body.querySelectorAll('script')
  var l = $scripts.length
  var runList = []

  for (let i = 0; i < l; i++) {
    runList.push((params, callback) => {
      insertScript.call(this, $scripts[i], callback)
    })
  }

  // insert the script tags sequentially
  // so we preserve execution order
  util.seq(runList)
}
