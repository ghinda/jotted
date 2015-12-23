/* jotted
 */

import '../node_modules/babel-polyfill/browser.js'

import * as util from './util.js'
import * as template from './template.js'
import * as plugin from './plugin.js'
import PubSoup from './pubsoup.js'

class Jotted {
  constructor ($editor, opts) {
    this.options = util.extend(opts, {
      files: [],
      showBlank: false,
      pane: 'result',
      debounce: 250,
      plugins: []
    })

    this.pubsoup = new PubSoup()
    // debounced trigger method
    this.trigger = util.debounce(this.pubsoup.publish.bind(this.pubsoup), this.options.debounce)

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

    // done change on all subscribers,
    // render the results.
    this.done('change', this.changeCallback.bind(this))

    // show all tabs, even if empty
    if (this.options.showBlank) {
      this.$container.classList.add('jotted-nav-show-blank')
    }
  }

  findFile (type) {
    var file = {}

    for (let file of this.options.files) {
      if (file.type === type) {
        return file
      }
    }

    return file
  }

  markup (type, $parent) {
    // create the markup for an editor
    var file = this.findFile(type)

    var $editor = document.createElement('div')
    $editor.innerHTML = template.editorContent(type, file.url)
    $editor.className = template.editorClass(type)
    var $textarea = $editor.querySelector('textarea')

    $parent.appendChild($editor)

    // if we don't have a file for the current type
    if (typeof file.url === 'undefined' && typeof file.content === 'undefined') {
      return
    }

    // add the has-type class to the container
    this.$container.classList.add(template.hasFileClass(type))

    // file as string
    if (typeof file.content !== 'undefined') {
      this.setValue($textarea, file.content)
    } else if (typeof file.url !== 'undefined') {
      // file as url
      util.fetch(file.url, (err, res) => {
        if (err) {
          // show load errors
          this.error([ err.responseText ], {
            type: type,
            file: file
          })

          return
        }

        this.setValue($textarea, res)
      })
    }
  }

  setValue ($textarea, val) {
    $textarea.value = val

    // trigger change event, for initial render
    this.change({
      target: $textarea
    })
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

  changeCallback (errors, params) {
    this.error(errors, params)

    if (params.type === 'html') {
      this.$resultFrame.contentWindow.document.body.innerHTML = params.content
      return
    }

    if (params.type === 'css') {
      this.$styleInject.textContent = params.content
      return
    }

    if (params.type === 'js') {
      // catch and show js errors
      try {
        this.$resultFrame.contentWindow.eval(params.content)
      } catch (err) {
        // only show eval errors if we don't have other errors from plugins.
        // useful for preprocessor error reporting (eg. babel, coffeescript).
        if (!errors.length) {
          this.error([ err.message ], {
            type: 'js'
          })
        }
      }

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
    this.pubsoup.subscribe.apply(this.pubsoup, arguments)
  }

  off () {
    this.pubsoup.unsubscribe.apply(this.pubsoup, arguments)
  }

  done () {
    this.pubsoup.done.apply(this.pubsoup, arguments)
  }

  error (errors, params) {
    if (!errors.length) {
      return this.clearError(params)
    }

    this.$container.classList.add(`jotted-error-active-${params.type}`)

    var markup = ''
    for (let err of errors) {
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
import BundlePlugins from './bundle-plugins.js'
BundlePlugins(Jotted)

export default Jotted
