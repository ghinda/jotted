/* script tag runner
 */

import * as util from './util.js'

/* re-insert script tags
 */
function insertScript ($script, callback = function () {}) {
  let s = document.createElement('script')
  if ($script.src) {
    s.src = $script.src
  } else {
    s.textContent = $script.innerText
  }

  // re-insert the string tags so they execute
  this.$resultFrame.contentWindow.document.head.appendChild(s)

  if ($script.src) {
    s.onload = callback
    s.onerror = callback
  } else {
    callback()
  }
}

export default function runScripts (content) {
  /* get scripts tags from content added with innerhtml
   */
  var $scripts = this.$resultFrame.contentWindow.document.body.querySelectorAll('script')
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
