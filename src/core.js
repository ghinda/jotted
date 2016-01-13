/* jotted
 */

import * as util from './util.js'
import * as template from './template.js'
import * as plugin from './plugin.js'
import script from './script.js'
import PubSoup from './pubsoup.js'

class Jotted {
  constructor ($editor, opts) {
    if (!$editor) {
      throw new Error('Can\'t find Jotted container.')
    }

    this.options = util.extend(opts, {
      files: [],
      showBlank: false,
      runScripts: true,
      pane: 'result',
      debounce: 250,
      plugins: []
    })

    this.pubsoup = new PubSoup()
    // debounced trigger method
    this.trigger = util.debounce(this.pubsoup.publish.bind(this.pubsoup), this.options.debounce)

    // done change on all subscribers,
    // render the results.
    this.done('change', this.changeCallback.bind(this))

    this.$container = $editor
    this.$container.innerHTML = template.container()
    util.addClass(this.$container, template.containerClass())

    // default pane
    this.paneActive = this.options.pane
    util.addClass(this.$container, template.paneActiveClass(this.paneActive))

    this.$result = $editor.querySelector('.jotted-pane-result')
    this.createResultFrame()

    this.$pane = {}
    this.$status = {}

    for (let type of [ 'html', 'css', 'js' ]) {
      this.$pane[type] = $editor.querySelector(`.jotted-pane-${type}`)
      this.markup(type, this.$pane[type])
    }

    // change events
    this.$container.addEventListener('change', util.debounce(this.change.bind(this), this.options.debounce))
    this.$container.addEventListener('keyup', util.debounce(this.change.bind(this), this.options.debounce))

    // pane change
    this.$container.addEventListener('click', this.pane.bind(this))

    // init plugins
    this.plugins = {}
    plugin.init.call(this)

    // load files
    for (let type of [ 'html', 'css', 'js' ]) {
      this.load(type)
    }

    // show all tabs, even if empty
    if (this.options.showBlank) {
      util.addClass(this.$container, template.showBlankClass())
    }
  }

  findFile (type) {
    var file = {}

    for (let fileIndex in this.options.files) {
      let file = this.options.files[fileIndex]
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

    $parent.appendChild($editor)

    // get the status node
    this.$status[type] = this.$pane[type].querySelector('.jotted-status')

    // if we don't have a file for the current type
    if (typeof file.url === 'undefined' && typeof file.content === 'undefined') {
      return
    }

    // add the has-type class to the container
    util.addClass(this.$container, template.hasFileClass(type))
  }

  load (type) {
    // create the markup for an editor
    var file = this.findFile(type)
    var $textarea = this.$pane[type].querySelector('textarea')

    // file as string
    if (typeof file.content !== 'undefined') {
      this.setValue($textarea, file.content)
    } else if (typeof file.url !== 'undefined') {
      // show loading message
      this.status('loading', [ template.statusLoading(file.url) ], {
        type: type,
        file: file
      })

      // file as url
      util.fetch(file.url, (err, res) => {
        if (err) {
          // show load errors
          this.status('error', [ template.statusFetchError(err) ], {
            type: type
          })

          return
        }

        // clear the loading status
        this.clearStatus('loading', {
          type: type
        })

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
    if (!util.data(e.target, 'jotted-type')) {
      return
    }

    // don't use .trigger,
    // so we don't debounce different change calls (html, css, js)
    // causing only one of them to be inserted.
    // the textarea change event is debounced when attached.
    this.pubsoup.publish('change', {
      type: util.data(e.target, 'jotted-type'),
      file: util.data(e.target, 'jotted-file'),
      content: e.target.value
    })
  }

  createResultFrame (css = '') {
    // maintain previous styles
    var $newStyle = document.createElement('style')

    if (this.$styleInject) {
      $newStyle.textContent = this.$styleInject.textContent
    }

    this.$styleInject = $newStyle

    if (this.$resultFrame) {
      this.$result.removeChild(this.$resultFrame)
    }

    this.$resultFrame = document.createElement('iframe')
    this.$result.appendChild(this.$resultFrame)

    var $frameDoc = this.$resultFrame.contentWindow.document
    $frameDoc.open()
    $frameDoc.write(template.frameContent())
    $frameDoc.close()

    $frameDoc.head.appendChild(this.$styleInject)
  }

  changeCallback (errors, params) {
    this.status('error', errors, params)

    if (params.type === 'html') {
      // if we have script execution enabled,
      // re-create the iframe,
      // to stop execution of any previously started js,
      // and garbage collect it.
      if (this.options.runScripts) {
        this.createResultFrame()
      }

      this.$resultFrame.contentWindow.document.body.innerHTML = params.content

      if (this.options.runScripts) {
        script.call(this)
      }

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
          this.status('error', [ err.message ], {
            type: 'js'
          })
        }
      }

      return
    }
  }

  pane (e) {
    if (!util.data(e.target, 'jotted-type')) {
      return
    }

    util.removeClass(this.$container, template.paneActiveClass(this.paneActive))
    this.paneActive = util.data(e.target, 'jotted-type')
    util.addClass(this.$container, template.paneActiveClass(this.paneActive))

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

  status (statusType = 'error', messages = [], params = {}) {
    if (!messages.length) {
      return this.clearStatus(statusType, params)
    }

    // add error/loading class to status
    util.addClass(this.$status[params.type], template.statusClass(statusType))

    util.addClass(this.$container, template.statusActiveClass(params.type))

    var markup = ''
    messages.forEach(function (err) {
      markup += template.statusMessage(err)
    })

    this.$status[params.type].innerHTML = markup
  }

  clearStatus (statusType, params) {
    util.removeClass(this.$status[params.type], template.statusClass(statusType))
    util.removeClass(this.$container, template.statusActiveClass(params.type))
    this.$status[params.type].innerHTML = ''
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
