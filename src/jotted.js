/* jotted
 */

import * as util from './core/util.js'
import * as template from './core/template.js'
import * as plugin from './core/plugin.js'
import * as pubsoup from './core/pubsoup.js'

import PluginCodeMirror from './plugins/codemirror.js'
import PluginLess from './plugins/less.js'

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

    this.plugins = {}

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

    this.on('change', this.changeCallback.bind(this), 999)
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

    this.trigger('change', {
      type: e.target.dataset.jottedType,
      file: e.target.dataset.jottedFile,
      content: e.target.value
    })
  }

  changeCallback (params, callback) {
    if (params.type === 'html') {
      this.$resultFrame.contentWindow.document.body.innerHTML = params.content
      return
    }

    if (params.type === 'css') {
      this.$styleInject.textContent = params.content
      return
    }

    if (params.type === 'js') {
      // TODO plugin to show errors
      this.$resultFrame.contentWindow.eval(params.content)
      return
    }
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

  on () {
    pubsoup.subscribe.apply(this, arguments)
  }

  off () {
    pubsoup.unsubscribe.apply(this, arguments)
  }

  trigger () {
    pubsoup.publish.apply(this, arguments)
  }
}

// register plugins
Jotted.plugin = function () {
  return plugin.register.apply(this, arguments)
}

// register bundled plugins
Jotted.plugin('codemirror', PluginCodeMirror)
Jotted.plugin('less', PluginLess)

export default Jotted
