/* jotted
 */

import * as util from './util.js'
import * as template from './template.js'
import * as plugin from './plugin.js'
import PubSoup from './pubsoup.js'

class Jotted {
  constructor ($jottedContainer, opts) {
    if (!$jottedContainer) {
      throw new Error('Can\'t find Jotted container.')
    }

    // private data
    var _private = {}
    this._get = function (key) {
      return _private[key]
    }
    this._set = function (key, value) {
      _private[key] = value
      return _private[key]
    }

    // options
    var options = this._set('options', util.extend(opts, {
      files: [],
      showBlank: false,
      runScripts: true,
      pane: 'result',
      debounce: 250,
      plugins: []
    }))

    // PubSoup
    var pubsoup = this._set('pubsoup', new PubSoup())
    // debounced trigger method
    this._set('trigger', util.debounce(pubsoup.publish.bind(pubsoup), options.debounce))
    this._set('on', function () {
      pubsoup.subscribe.apply(pubsoup, arguments)
    })
    this._set('off', function () {
      pubsoup.unsubscribe.apply(pubsoup, arguments)
    })
    var done = this._set('done', function () {
      pubsoup.done.apply(pubsoup, arguments)
    })

    // iframe srcdoc support
    this._set('supportSrcdoc', !!('srcdoc' in document.createElement('iframe')))

    // done change on all subscribers,
    // render the results.
    done('change', this.changeCallback.bind(this))

    // DOM
    var $container = this._set('$container', $jottedContainer)
    $container.innerHTML = template.container()
    util.addClass($container, template.containerClass())

    var $resultFrame = $container.querySelector('.jotted-pane-result iframe')
    this._set('$resultFrame', $resultFrame)

    // default pane
    var paneActive = this._set('paneActive', options.pane)
    util.addClass($container, template.paneActiveClass(paneActive))

    // file content caching
    this._set('content', {
      html: '',
      css: '',
      js: ''
    })

    // status nodes
    this._set('$status', {})

    for (let type of [ 'html', 'css', 'js' ]) {
      this.markup(type)
    }

    // change events
    $container.addEventListener('keyup', util.debounce(this.change.bind(this), options.debounce))

    // pane change
    $container.addEventListener('click', this.pane.bind(this))

    // expose public properties
    this.$container = this._get('$container')
    this.on = this._get('on')
    this.off = this._get('off')
    this.done = this._get('done')
    this.trigger = this._get('trigger')
    this.paneActive = this._get('paneActive')

    // init plugins
    this._set('plugins', {})
    plugin.init.call(this)

    // load files
    for (let type of [ 'html', 'css', 'js' ]) {
      this.load(type)
    }

    // show all tabs, even if empty
    if (options.showBlank) {
      for (let type of [ 'html', 'css', 'js' ]) {
        util.addClass($container, template.hasFileClass(type))
      }
    }
  }

  findFile (type) {
    var file = {}
    var options = this._get('options')

    for (let fileIndex in options.files) {
      let file = options.files[fileIndex]
      if (file.type === type) {
        return file
      }
    }

    return file
  }

  markup (type) {
    var $container = this._get('$container')
    var $parent = $container.querySelector(`.jotted-pane-${type}`)
    // create the markup for an editor
    var file = this.findFile(type)

    var $editor = document.createElement('div')
    $editor.innerHTML = template.editorContent(type, file.url)
    $editor.className = template.editorClass(type)

    $parent.appendChild($editor)

    // get the status node
    this._get('$status')[type] = $parent.querySelector('.jotted-status')

    // if we have a file for the current type
    if (typeof file.url !== 'undefined' || typeof file.content !== 'undefined') {
      // add the has-type class to the container
      util.addClass($container, template.hasFileClass(type))
    }
  }

  load (type) {
    // create the markup for an editor
    var file = this.findFile(type)
    var $textarea = this._get('$container').querySelector(`.jotted-pane-${type} textarea`)

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
    } else {
      // trigger a change event on blank editors,
      // for editor plugins to catch.
      // (eg. the codemirror and ace plugins attach the change event
      // only after the initial change/load event)
      this.setValue($textarea, '')
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
    this._get('pubsoup').publish('change', {
      type: util.data(e.target, 'jotted-type'),
      file: util.data(e.target, 'jotted-file'),
      content: e.target.value
    })
  }

  changeCallback (errors, params) {
    this.status('error', errors, params)
    var options = this._get('options')
    var supportSrcdoc = this._get('supportSrcdoc')
    var $resultFrame = this._get('$resultFrame')

    // cache manipulated content
    var cachedContent = this._get('content')
    cachedContent[params.type] = params.content

    // don't execute script tags
    if (!options.runScripts) {
      // for IE9 support, remove the script tags from HTML content.
      // when we stop supporting IE9, we can use the sandbox attribute.
      var fragment = document.createElement('div')
      fragment.innerHTML = cachedContent['html']

      // remove all script tags
      var $scripts = fragment.querySelectorAll('script')
      for (let i = 0; i < $scripts.length; i++) {
        $scripts[i].parentNode.removeChild($scripts[i])
      }

      cachedContent['html'] = fragment.innerHTML
    }

    $resultFrame.setAttribute('srcdoc', template.frameContent(cachedContent['css'], cachedContent['html'], cachedContent['js']))

    // older browsers without iframe srcset support (IE9)
    if (!supportSrcdoc) {
      // tips from https://github.com/jugglinmike/srcdoc-polyfill
      // Copyright (c) 2012 Mike Pennisi
      // Licensed under the MIT license.
      var jsUrl = 'javascript:window.frameElement.getAttribute("srcdoc");'

      $resultFrame.setAttribute('src', jsUrl)

      // Explicitly set the iFrame's window.location for
      // compatibility with IE9, which does not react to changes in
      // the `src` attribute when it is a `javascript:` URL.
      if ($resultFrame.contentWindow) {
        $resultFrame.contentWindow.location = jsUrl
      }
    }
  }

  pane (e) {
    if (!util.data(e.target, 'jotted-type')) {
      return
    }

    var $container = this._get('$container')
    var paneActive = this._get('paneActive')
    util.removeClass($container, template.paneActiveClass(paneActive))

    paneActive = this._set('paneActive', util.data(e.target, 'jotted-type'))
    util.addClass($container, template.paneActiveClass(paneActive))

    e.preventDefault()
  }

  status (statusType = 'error', messages = [], params = {}) {
    if (!messages.length) {
      return this.clearStatus(statusType, params)
    }

    var $status = this._get('$status')

    // add error/loading class to status
    util.addClass($status[params.type], template.statusClass(statusType))

    util.addClass(this._get('$container'), template.statusActiveClass(params.type))

    var markup = ''
    messages.forEach(function (err) {
      markup += template.statusMessage(err)
    })

    $status[params.type].innerHTML = markup
  }

  clearStatus (statusType, params) {
    var $status = this._get('$status')

    util.removeClass($status[params.type], template.statusClass(statusType))
    util.removeClass(this._get('$container'), template.statusActiveClass(params.type))
    $status[params.type].innerHTML = ''
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
