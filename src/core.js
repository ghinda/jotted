/* jotted
 */

import * as util from './util.js'
import * as template from './template.js'
import * as plugin from './plugin.js'
import * as pubsoup from './pubsoup.js'

import PluginAce from './plugins/ace.js'
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
    this.$pane = {}
    this.$error = {}

    for (let type of [ 'html', 'css', 'js' ]) {
      this.$pane[type] = $editor.querySelector(`.jotted-pane-${type}`)
      this.markup(type, this.$pane[type])

      this.$error[type] = this.$pane[type].querySelector('.jotted-error')
    }

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

//     this.on('change', this.changeCallback.bind(this), 999)

    this.done('change', this.changeCallback.bind(this))
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

  changeCallback (err, params) {
    if (err) {
      this.error(err, params)
    }

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

  done () {
    pubsoup.done.apply(this, arguments)
  }

  error (err, params) {
    if (!err.length) {
      return this.clearError(params)
    }

    this.$container.classList.add(`jotted-error-active-${params.type}`)

    var markup = ''
    for (let e of err) {
      markup += template.errorMessage(err)
    }

    this.$error[params.type].innerHTML = markup
  }

  clearError (params) {
    this.$container.classList.remove(`jotted-error-active-${params.type}`)
    this.$error[params.type].innerHTML = ''
  }
}

// register plugins
Jotted.plugin = function () {
  return plugin.register.apply(this, arguments)
}

// register bundled plugins
Jotted.plugin('codemirror', PluginCodeMirror)
Jotted.plugin('ace', PluginAce)
Jotted.plugin('less', PluginLess)

export default Jotted
