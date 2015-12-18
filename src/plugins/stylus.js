/* stylus plugin
 */

import * as util from '../util.js'

export default class PluginStylus {
  constructor (jotted, options) {
    var priority = 20

    this.editor = {}

    options = util.extend(options, {})

    // check if stylus is loaded
    if (typeof window.stylus === 'undefined') {
      return
    }

    jotted.$container.classList.add('jotted-plugin-stylus')

    // change CSS link label to Stylus
    jotted.$container.querySelector('a[data-jotted-type="css"]').innerHTML = 'Stylus'

    jotted.on('change', this.change.bind(this), priority)
  }

  isStylus (params) {
    if (params.type !== 'css') {
      return false
    }

    return (params.file.indexOf('.styl') !== -1 || params.file === '')
  }

  change (params, callback) {
    // only parse .styl and blank files
    if (this.isStylus(params)) {
      window.stylus(params.content, this.options).render((err, res) => {
        if (err) {
          return callback(err, params)
        } else {
          // replace the content with the parsed less
          params.content = res
        }

        callback(null, params)
      })
    } else {
      // make sure we callback either way,
      // to not break the pubsoup
      callback(null, params)
    }
  }
}
