/* coremirror plugin
 */

import * as util from '../util.js'

export default class PluginCodeMirror {
  constructor (jotted, options) {
    var priority = 1
    var i

    this.editor = {}

    options = util.extend(options, {
      lineNumbers: true
    })

    // check if CodeMirror is loaded
    if (typeof window.CodeMirror === 'undefined') {
      return
    }

    jotted.$container.classList.add('jotted-plugin-codemirror')

    var $editors = jotted.$container.querySelectorAll('.jotted-editor')

    for (i = 0; i < $editors.length; i++) {
      let $textarea = $editors[i].querySelector('textarea')
      let type = $textarea.dataset.jottedType
      let file = $textarea.dataset.jottedFile

      this.editor[type] = window.CodeMirror.fromTextArea($textarea, options)
      let editor = this.editor[type]

      editor.on('change', () => {
        $textarea.value = editor.getValue()

        // trigger a change event
        jotted.trigger('change', {
          cmEditor: editor,
          type: type,
          file: file,
          content: $textarea.value
        })
      })
    }

    jotted.on('change', util.debounce(this.change.bind(this), jotted.options.debounce), priority)
  }

  change (params, callback) {
    var editor = this.editor[params.type]

    // if the event is not started by the codemirror change
    if (!params.cmEditor) {
      editor.setValue(params.content)
    }

    // manipulate the params and pass them on
    params.content = editor.getValue()
    callback(null, params)
  }
}
