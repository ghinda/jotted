/* coremirror plugin
 */

import * as util from '../core/util.js'

export default class PluginCodeMirror {
  constructor (jotted, options) {
    var priority = 90
    var i
    this.chChange = false

    this.editorHTML = {}
    this.editorCSS = {}
    this.editorJS = {}

    this.textareaHTML = {}
    this.textareaCSS = {}
    this.textareaJS = {}

    options = util.extend(options, {})

    // check if CodeMirror is loaded
    if (typeof window.CodeMirror === 'undefined') {
      return
    }

    jotted.$container.classList.add('jotted-plugin-codemirror')

    var $editors = jotted.$container.querySelectorAll('.jotted-editor')

    for (i = 0; i < $editors.length; i++) {
      let $editor = $editors[i]
      let $textarea = $editor.querySelector('textarea')
      let type = $textarea.dataset.jottedType

      var editor = window.CodeMirror.fromTextArea($editor.querySelector('textarea'), {
        lineNumbers: true
      })

      editor.on('change', () => {
        this.cmChange = true
        $textarea.value = editor.getValue()

        // TODO get real data form the editor
        jotted.trigger('change', {
          type: 'html',
          name: 'test.html',
          content: $textarea.value
        })
      })

      if (type === 'html') {
        this.editorHTML = editor
        this.$textareaHTML = $textarea
      }

      if (type === 'css') {
        this.editorCSS = editor
        this.$textareaCSS = $textarea
      }

      if (type === 'js') {
        this.editorJS = editor
        this.$textareaJS = $textarea
      }
    }

    jotted.on('change', this.change.bind(this), priority)
  }

  change (params, callback) {
    var editor = this.editorHTML

    if (params.type === 'css') {
      editor = this.editorCSS
    }

    if (params.type === 'js') {
      editor = this.editorJS
    }

    // TODO check if the event was triggered from the codemirror change
    if (!this.cmChange) {
      editor.setValue(params.content)
    }

    setTimeout(function () {
      this.cmChange = false
      params.content = editor.getValue()
      callback(null, params)
    }, 500)
  }
}
