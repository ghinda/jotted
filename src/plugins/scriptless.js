/* scriptless plugin
 * removes script tags from html content
 */

import * as util from '../util.js'

export default class PluginScriptless {
  constructor (jotted, options) {
    options = util.extend(options, {})

    // remove script tags on each change
    jotted.on('change', this.change.bind(this))
  }

  change (params, callback) {
    if (params.type !== 'html') {
      return
    }

    // for IE9 support, remove the script tags from HTML content.
    // when we stop supporting IE9, we can use the sandbox attribute.
    var fragment = document.createElement('div')
    fragment.innerHTML = params.content

    // remove all script tags
    // TODO only remove script tags with valid types
    var $scripts = fragment.querySelectorAll('script')
    for (let i = 0; i < $scripts.length; i++) {
      $scripts[i].parentNode.removeChild($scripts[i])
    }

    params.content = fragment.innerHTML
  }
}
