/* ace plugin
 */

import * as util from '../util.js'

export default class PluginAce {
  constructor (jotted, options) {
    var priority = 1
    var i

    this.editor = {}
    this.jotted = jotted

    options = util.extend(options, {})

    // check if Ace is loaded
    if (typeof window.ace === 'undefined') {
      return
    }

    var $editors = jotted.$container.querySelectorAll('.jotted-editor')

    for (i = 0; i < $editors.length; i++) {
      let $textarea = $editors[i].querySelector('textarea')
      let type = util.data($textarea, 'jotted-type')
      let file = util.data($textarea, 'jotted-file')

      let $aceContainer = document.createElement('div')
      $editors[i].appendChild($aceContainer)

      this.editor[type] = window.ace.edit($aceContainer)
      let editor = this.editor[type]

      let editorOptions = util.extend(options)

      editor.getSession().setMode('ace/mode/' + util.getMode(type, file))
      editor.getSession().setOptions(editorOptions)

      editor.$blockScrolling = Infinity
    }

    jotted.on('change', this.change.bind(this), priority)
  }

  editorChange (params) {
    return () => {
      this.jotted.trigger('change', params)
    }
  }

  change (params, callback) {
    var editor = this.editor[params.type]

    // if the event is not started by the ace change.
    // triggered only once per editor,
    // when the textarea is populated/file is loaded.
    if (!params.aceEditor) {
      editor.getSession().setValue(params.content)

      // attach the event only after the file is loaded
      params.aceEditor = editor
      editor.on('change', this.editorChange(params))
    }

    // manipulate the params and pass them on
    params.content = editor.getValue()
    callback(null, params)
  }
}
