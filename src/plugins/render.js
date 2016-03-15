/* render plugin
 * renders the iframe
 */

import * as util from '../util.js'

export default class PluginRender {
  constructor (jotted, options) {
    options = util.extend(options, {})

    // iframe srcdoc support
    var supportSrcdoc = !!('srcdoc' in document.createElement('iframe'))
    var $resultFrame = jotted.$container.querySelector('.jotted-pane-result iframe')

    var frameContent = ''
    var latestCallback = function () {}

    // cached content
    var content = {
      html: '',
      css: '',
      js: ''
    }

    // catch domready events from the iframe
    window.addEventListener('message', this.domready.bind(this))

    // render on each change
    jotted.on('change', this.change.bind(this), 100)

    // public
    this.supportSrcdoc = supportSrcdoc
    this.latestCallback = latestCallback
    this.content = content
    this.frameContent = frameContent
    this.$resultFrame = $resultFrame
  }

  template (style = '', body = '', script = '') {
    return `
      <!doctype html>
      <html>
        <head>
          <script>
            (function () {
              window.addEventListener('DOMContentLoaded', function () {
                window.parent.postMessage(JSON.stringify({
                  type: 'jotted-dom-ready'
                }), '*')
              })
            }())
          </script>

          <style>${style}</style>
        </head>
        <body>
          ${body}

          <!--
            Jotted:
            Empty script tag prevents malformed HTML from breaking the next script.
          -->
          <script></script>
          <script>${script}</script>
        </body>
      </html>
    `
  }

  change (params, callback) {
    // cache manipulated content
    this.content[params.type] = params.content

    // check existing and to-be-rendered content
    var oldFrameContent = this.frameContent
    this.frameContent = this.template(this.content['css'], this.content['html'], this.content['js'])

    // don't render if previous and new frame content are the same.
    // mostly for the `play` plugin,
    // so we don't re-render the same content on each change.
    // unless we set forceRender.
    if (params.forceRender !== true && this.frameContent === oldFrameContent) {
      callback(null, params)
      return
    }

    // cache the current callback as a global,
    // so we can call it from the message callback.
    this.latestCallback = function () {
      callback(null, params)
    }

    this.$resultFrame.setAttribute('srcdoc', this.frameContent)

    // older browsers without iframe srcset support (IE9)
    if (!this.supportSrcdoc) {
      // tips from https://github.com/jugglinmike/srcdoc-polyfill
      // Copyright (c) 2012 Mike Pennisi
      // Licensed under the MIT license.
      var jsUrl = 'javascript:window.frameElement.getAttribute("srcdoc");'

      this.$resultFrame.setAttribute('src', jsUrl)

      // Explicitly set the iFrame's window.location for
      // compatibility with IE9, which does not react to changes in
      // the `src` attribute when it is a `javascript:` URL.
      if (this.$resultFrame.contentWindow) {
        this.$resultFrame.contentWindow.location = jsUrl
      }
    }
  }

  domready (e) {
    // only catch messages from the iframe
    if (e.source !== this.$resultFrame.contentWindow) {
      return
    }

    var data = JSON.parse(e.data)
    if (data.type === 'jotted-dom-ready') {
      this.latestCallback()
    }
  }
}
