/* markdown plugin
 */

import * as util from '../util.js'

export default class PluginMarkdown {
  constructor (jotted, options) {
    var priority = 20

    this.options = util.extend(options, {})

    // check if marked is loaded
    if (typeof window.marked === 'undefined') {
      return
    }

    window.marked.setOptions(options)

    jotted.$container.classList.add('jotted-plugin-markdown')

    // change html link label
    jotted.$container.querySelector('a[data-jotted-type="html"]').innerHTML = 'Markdown'

    jotted.on('change', this.change.bind(this), priority)
  }

  change (params, callback) {
    // only parse html content
    if (params.type === 'html') {
      try {
        params.content = window.marked(params.content)
      } catch (err) {
        return callback(err, params)
      }

      callback(null, params)
    } else {
      // make sure we callback either way,
      // to not break the pubsoup
      callback(null, params)
    }
  }
}
