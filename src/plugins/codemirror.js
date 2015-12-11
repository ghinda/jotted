/* coremirror plugin
 */

import * as util from '../core/util.js'

var editor
var $textarea
var cmChange = false

export default class PluginCodeMirror {
  constructor () {
    this.priority = 99
  }

  init (opts) {
    this.pluginOptions = util.extend(opts, {})

    // check if CodeMirror is loaded
    if (typeof window.CodeMirror === 'undefined') {
      return
    }

    this.$container.classList.add('jotted-plugin-codemirror')

    var $editor = this.$html.querySelector('.jotted-editor')
    $textarea = $editor.querySelector('textarea')

    editor = window.CodeMirror.fromTextArea($editor.querySelector('textarea'), {
      lineNumbers: true
    })

    editor.on('change', function () {
      cmChange = true
      $textarea.value = editor.getValue()

      var change = new Event('change', {
        bubbles: true
      })
      $textarea.dispatchEvent(change)
    })
  }

  html (params, callback) {
    // TODO check if the event was triggered from the codemirror change
    if (!cmChange) {
      editor.setValue($textarea.value)
    }

    setTimeout(function () {
      cmChange = false
      params.content = editor.getValue()
      callback(null, params)
    }, 500)
  }
}
