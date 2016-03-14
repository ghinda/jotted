/* play plugin
 * adds a Run button
 */

import * as util from '../util.js'

export default class PluginPlay {
  constructor (jotted, options) {
    options = util.extend(options, {
      firstRun: true
    })

    var priority = 10
    // cached code
    var cache = {}
    // latest version of the code.
    // replaces the cache when the run button is pressed.
    var code = {}

    // set firstRun=false to start with a blank preview.
    // run the real content only after the first Run button press.
    if (options.firstRun === false) {
      cache = {
        html: {
          type: 'html',
          content: ''
        },
        css: {
          type: 'css',
          content: ''
        },
        js: {
          type: 'js',
          content: ''
        }
      }
    }

    // run button
    var $button = document.createElement('button')
    $button.className = 'jotted-button jotted-button-play'
    $button.innerHTML = 'Run'

    jotted.$container.appendChild($button)
    $button.addEventListener('click', this.run.bind(this))

    // capture the code on each change
    jotted.on('change', this.change.bind(this), priority)

    // public
    this.cache = cache
    this.code = code
    this.jotted = jotted
  }

  change (params, callback) {
    // always cache the latest code
    this.code[params.type] = util.extend(params)

    // replace the params with the latest cache
    if (typeof this.cache[params.type] !== 'undefined') {
      callback(null, this.cache[params.type])

      // make sure we don't cache forceRender,
      // and send it with each change.
      this.cache[params.type].forceRender = null
    } else {
      // cache the first run
      this.cache[params.type] = util.extend(params)

      callback(null, params)
    }
  }

  run () {
    // trigger change on each type with the latest code
    for (let type in this.code) {
      // check if code of type has changed
      if (this.cache[type].content !== this.code[type].content) {
        this.cache[type] = util.extend(this.code[type], {
          // force rendering on each Run press
          forceRender: true
        })

        // trigger the change
        this.jotted.trigger('change', this.cache[type])
      }
    }
  }
}
