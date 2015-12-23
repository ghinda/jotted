/* coffeescript plugin
 */

import * as util from '../util.js'

export default class PluginCoffeeScript {
  constructor (jotted, options) {
    var priority = 20

    options = util.extend(options, {})

    // check if coffeescript is loaded
    if (typeof window.CoffeeScript === 'undefined') {
      return
    }

    jotted.$container.classList.add('jotted-plugin-less')

    // change JS link label to Less
    jotted.$container.querySelector('a[data-jotted-type="js"]').innerHTML = 'CoffeeScript'

    jotted.on('change', this.change.bind(this), priority)
  }

  isCoffee (params) {
    if (params.type !== 'js') {
      return false
    }

    return (params.file.indexOf('.coffee') !== -1 || params.file === '')
  }

  change (params, callback) {
    // only parse .less and blank files
    if (this.isCoffee(params)) {
      try {
        params.content = window.CoffeeScript.compile(params.content)
      } catch (err) {
        return callback(err, params)
      }
    }

    callback(null, params)
  }
}
