/* ace plugin
 */

import * as util from '../core/util.js'

var editor
var $textarea

export default class PluginAce {
  constructor () {
    this.priority = 99
  }

  init (opts) {
    this.pluginOptions = util.extend(opts, {})

    // check if ace is loaded
    if (typeof window.ace === 'undefined') {
      return
    }

    this.$container.classList.add('jotted-plugin-ace')

    var $aceHTML = document.createElement('div')

    var $editor = this.$html.querySelector('.jotted-editor')

    $editor.appendChild($aceHTML)
    editor = window.ace.edit($aceHTML)
    editor.setOptions({
      mode: 'ace/mode/html'
    })

    $textarea = $editor.querySelector('textarea')

//     this.$container.removeEventListener('change', this.debounceChange)
//     this.$container.removeEventListener('keyup', this.debounceChange)

    editor.on('change', () => {
      console.log('change')
      $textarea.value = editor.getValue()

      this.change({
        target: $textarea
      })

//       $textarea.change()
    })

//     editor.setValue($textarea.value)

//     editor.getSession().setValue('tesgfhfghfghfghgfht')

    // `this` is the jotted instance
//     console.log(this)

    // TODO check if ace is loaded, if it is, use it on the textareas
  }

  html (params, callback) {
    editor.setValue($textarea.value)

    setTimeout(function () {
      callback(null, params)
    }, 500)
  }
}
