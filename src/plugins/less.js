/* less plugin
 */

import * as util from '../util.js'

export default class PluginLess {
  constructor (jotted, options) {
    var priority = 20

    this.editor = {}

    options = util.extend(options, {})

    // check if less is loaded
    if (typeof window.less === 'undefined') {
      return
    }

    jotted.$container.classList.add('jotted-plugin-less')

    // change CSS link label to Less
    jotted.$container.querySelector('a[data-jotted-type="css"]').innerHTML = 'Less'

    jotted.on('change', this.change.bind(this), priority)
  }

  isLess (params) {
    if (params.type !== 'css') {
      return false
    }

    return (params.file.indexOf('.less') !== -1 || params.file === '')
  }

  change (params, callback) {
    // only parse .less and blank files
    if (this.isLess(params)) {
      window.less.render(params.content, this.options, (err, res) => {
        if (err) {
          return callback(err, params)
        } else {
          // replace the content with the parsed less
          params.content = res.css
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
