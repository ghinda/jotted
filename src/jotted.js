/* jotted
 */

import * as util from './core/util.js'
import * as template from './core/template.js'
import * as plugin from './core/plugin.js'
import PluginAce from './plugins/ace.js'

class Jotted {
  constructor ($editor, opts) {
    this.options = util.extend(opts, {
      showBlank: false,
      debounce: 250,
      plugins: {
        ace: {}
      }
    })

    this.$container = $editor
    this.$container.innerHTML = template.container()
    this.$container.classList.add(template.containerClass())

    if (this.options.showEmpty) {
      this.$container.classList.add(template.showBlankClass())
    }

    this.$result = $editor.querySelector('.jotted-pane-result')
    this.$html = $editor.querySelector('.jotted-pane-html')
    this.$css = $editor.querySelector('.jotted-pane-css')
    this.$js = $editor.querySelector('.jotted-pane-js')

    this.markup('html', this.$html)
    this.markup('css', this.$css)
    this.markup('js', this.$js)

    this.$resultFrame = this.$result.querySelector('iframe')

    this.$styleInject = document.createElement('style')
    this.$resultFrame.contentWindow.document.head.appendChild(this.$styleInject)

    // change events
    this.$container.addEventListener('change', util.debounce(this.change.bind(this), this.options.debounce))
    this.$container.addEventListener('keyup', util.debounce(this.change.bind(this), this.options.debounce))

    // init plugins
    plugin.init.call(this)
  }

  markup (type, $parent) {
    // create the markup for an editor
    var file = this.$container.dataset[type] || ''

    var $editor = document.createElement('div')
    $editor.innerHTML = template.editorContent(type, file)
    $editor.className = template.editorClass(type)
    var $textarea = $editor.querySelector('textarea')

    $parent.appendChild($editor)

    if (file !== '') {
      this.$container.classList.add(template.hasFileClass(type))

      util.fetch(file, (err, res) => {
        if (err) {
          return
        }

        $textarea.value = res

        // simulate change event
        this.change({
          target: $textarea
        })
      })
    }
  }

  change (e) {
    if (e.target.tagName.toLowerCase() !== 'textarea') {
      return
    }

    var type = e.target.dataset.type

    // run all plugins, then do magic
    plugin.run.call(this, type, {
      name: e.target.dataset.file,
      content: e.target.value
    }, (err, res) => {
      if (err) {
        return err
      }

      if (type === 'html') {
        this.$resultFrame.contentWindow.document.body.innerHTML = res.content
        return
      }

      if (type === 'css') {
        this.$styleInject.textContent = res.content
        return
      }

      if (type === 'js') {
        // TODO plugin to show errors
        this.$resultFrame.contentWindow.eval(res.content)
        return
      }
    })
  }
}

// register plugins
Jotted.plugin = function () {
  return plugin.register.apply(this, arguments)
}

// register bundled plugins
Jotted.plugin('ace', new PluginAce())

export default Jotted
