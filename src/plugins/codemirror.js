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

    var $editors = jotted.$container.querySelectorAll('.jotted-editor')

    for (i = 0; i < $editors.length; i++) {
      let $textarea = $editors[i].querySelector('textarea')
      let type = util.data($textarea, 'jotted-type')
      let file = util.data($textarea, 'jotted-file')

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

    jotted.on('change', this.change.bind(this), priority)
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
