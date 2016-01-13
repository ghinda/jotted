/* jotted
 * website
 */

(function () {
  'use strict'

  var $demoHeader = document.getElementById('j-header')
  if ($demoHeader) {
    // header demo
    new Jotted($demoHeader, {
      files: [{
        type: 'html',
        url: 'demo-home/ripple.html'
      }, {
        type: 'css',
        url: 'demo-home/ripple.css'
      }, {
        type: 'js',
        url: 'demo-home/ripple.js'
      }],
      plugins: [ 'codemirror' ]
    })
  }
})()
