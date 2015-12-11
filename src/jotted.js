/* jotted
 */

import * as util from './core/util.js'
import * as template from './core/template.js'
import * as plugin from './core/plugin.js'
import PluginAce from './plugins/ace.js'
import PluginCodeMirror from './plugins/codemirror.js'

class Jotted {
  constructor ($editor, opts) {
    this.options = util.extend(opts, {
      showBlank: false,
      pane: 'result',
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

    // default pane
    this.paneActive = this.options.pane
    this.$container.classList.add(template.paneActiveClass(this.paneActive))

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

    // pane change
    this.$container.addEventListener('click', this.pane.bind(this))

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
    if (!e.target.dataset.jottedType) {
      return
    }

    var type = e.target.dataset.jottedType

    // run all plugins, then do magic
    plugin.run.call(this, type, {
      name: e.target.dataset.jottedFile,
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

  pane (e) {
    if (!e.target.dataset.jottedType) {
      return
    }

    this.$container.classList.remove(template.paneActiveClass(this.paneActive))
    this.paneActive = e.target.dataset.jottedType
    this.$container.classList.add(template.paneActiveClass(this.paneActive))

    e.preventDefault()
  }
}

// register plugins
Jotted.plugin = function () {
  return plugin.register.apply(this, arguments)
}

// register bundled plugins
// TODO create a new instance of each plugin on init
Jotted.plugin('ace', new PluginAce())
Jotted.plugin('codemirror', new PluginCodeMirror())

export default Jotted
