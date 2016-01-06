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
        url: 'index.html'
      }]
    })
  }
})()
