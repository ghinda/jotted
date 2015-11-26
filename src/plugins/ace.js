/* ace plugin
 */

import * as util from '../core/util.js'

export default class PluginAce {
  constructor () {
    this.priority = 99
  }

  init (opts) {
    this.options = util.extend(opts, {})

    // `this` is the jotted instance
//     console.log(this)

    // TODO check if ace is loaded, if it is, use it on the textareas
  }

  html (params, callback) {
    params.content = 'ACE' + params.content

    setTimeout(function () {
      callback(null, params)
    }, 500)
  }
}
