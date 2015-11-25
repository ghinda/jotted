/* jotted
 */

import * as util from './core/util.js'
import * as template from './core/template.js'
import * as plugin from './core/plugin.js'
import PluginAce from './plugins/ace.js'

class Jotted {
  constructor ($editor, opts) {
    this.plugins = {}
    this.options = util.extend(opts, {
      showEmpty: false,
      plugins: {
        ace: {}
      }
    })

    this.$container = $editor
    this.$container.innerHTML = template.container()

    if (this.options.showEmpty) {
      this.$container.classList.add('jotted-show-empty')
    }

    this.$result = $editor.querySelector('.jotted-pane-result')
    this.$html = $editor.querySelector('.jotted-pane-html')
    this.$css = $editor.querySelector('.jotted-pane-css')
    this.$js = $editor.querySelector('.jotted-pane-js')

    this.dom('html', this.$html)
    this.dom('css', this.$css)
    this.dom('js', this.$js)

    this.$resultFrame = this.$result.querySelector('iframe')

    this.$styleInject = document.createElement('style')
    this.$resultFrame.contentWindow.document.head.appendChild(this.$styleInject)

    // TODO debouncer
    this.$container.addEventListener('change', this.change.bind(this))
    this.$container.addEventListener('keyup', this.change.bind(this))

    // init plugins
    for (let pluginId in this.options.plugins) {
      let pluginInstance = new PluginAce()
      this.register(pluginId, pluginInstance)

      // plugin init, for dom manipulation, etc.
      pluginInstance.init.call(this, this.options.plugins[pluginId])
    }
  }

  dom (type, $parent) {
    var files = ['']

    if (this.$container.dataset[type]) {
      files = this.$container.dataset[type].split(';')
    }

    files.forEach(file => {
      // add a blank container if we have no files of the type
      if (file.trim() === '') {
        file = 'blank'
      }

      var $editor = document.createElement('div')
      $editor.innerHTML = template.editorContent()
      $editor.className = template.editorClass(type, file)

      var $textarea = $editor.querySelector('textarea')
      $textarea.dataset.type = type

      $parent.appendChild($editor)

      if (file !== 'blank') {
        util.fetch(file, (err, res) => {
          if (err) {
            return
          }

          $textarea.value = res
          // TODO trigger change events
        })
      }
    })
  }

  change (e) {
    if (e.target.tagName.toLowerCase() !== 'textarea') {
      return
    }

    // TODO check type and run plugins, then do magic

    var type = e.target.dataset.type

    if (type === 'html') {
      this.$resultFrame.contentWindow.document.body.innerHTML = e.target.value
      return
    }

    if (type === 'css') {
      this.$styleInject.textContent = e.target.value
      return
    }

    if (type === 'js') {
      // TODO plugin to show errors
      this.$resultFrame.contentWindow.eval(e.target.value)
      return
    }
  }

  // register plugins
  register () {
    return plugin.register.apply(this, arguments)
  }
}

export default Jotted
