/* ace plugin
 */

import * as util from '../core/util.js'

export default class PluginAce {
  constructor (jotted, options) {
    var priority = 1
    var i

    this.editor = {}

    this.modemap = {
      'html': 'html',
      'css': 'css',
      'less': 'less',
      'js': 'javascript'
    }

    options = util.extend(options, {
      lineNumbers: true
    })

    // check if Ace is loaded
    if (typeof window.ace === 'undefined') {
      return
    }

    jotted.$container.classList.add('jotted-plugin-ace')

    var $editors = jotted.$container.querySelectorAll('.jotted-editor')

    for (i = 0; i < $editors.length; i++) {
      let $textarea = $editors[i].querySelector('textarea')
      let type = $textarea.dataset.jottedType
      let file = $textarea.dataset.jottedFile

      let $aceContainer = document.createElement('div')
      $editors[i].appendChild($aceContainer)

      this.editor[type] = window.ace.edit($aceContainer)
      let editor = this.editor[type]

      let editorOptions = util.extend(options)

      editor.getSession().setMode(this.aceMode(type, file))
      editor.getSession().setOptions(editorOptions)

      editor.on('change', () => {
        $textarea.value = editor.getValue()

        // trigger a change event
        jotted.trigger('change', {
          aceEditor: editor,
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

    // if the event is not started by the ace change
    if (!params.aceEditor) {
      editor.setValue(params.content, -1)
    }

    // manipulate the params and pass them on
    params.content = editor.getValue()
    callback(null, params)
  }

  aceMode (type, file) {
    var mode = 'ace/mode/'

    // try the file extension
    for(let key in this.modemap) {
      if (file.indexOf('.' + key) !== -1) {
        return mode + this.modemap[key]
      }
    }

    // try the file type (html/css/js)
    for(let key in this.modemap) {
      if (type === key) {
        return mode + this.modemap[key]
      }
    }

    return mode + type
  }
}
