/* script tag runner
 */

import * as util from './util.js'

/* re-insert script tags
 */
function insertScript ($script, callback = function () {}) {
  let s = document.createElement('script')
  s.type = 'text/javascript'
  if ($script.src) {
    s.onload = callback
    s.onerror = callback
    s.src = $script.src
  } else {
    // wrap inline scripts in a timeout,
    // to make sure they don't execute if the iframe is destroyed,
    // and get the garbage collected.
    // when using a plugin that triggers another quick change event
    // - ace/codemirror, inline scripts would still execute,
    // but without some of the other external script dependencies.
    // eg. when using jotted with codemirror to demo jotted,
    // in one of the two inline script runs, `Jotted` would be undefined,
    // because jotted.js was unloaded from memory when the iframe was removed,
    // but the `new Jotted(..` inline script would still run.
    s.textContent = `setTimeout(function(){${$script.innerText}})`
  }

  // re-insert the script tag so it executes.
  this.$resultFrame.contentWindow.document.head.appendChild(s)

  // run the callback immediately for inline scripts
  if (!$script.src) {
    callback()
  }
}

export default function runScripts (content) {
  // get scripts tags from content added with innerhtml
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
