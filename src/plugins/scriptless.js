/* scriptless plugin
 * removes script tags from html content
 */

import * as util from '../util.js'

export default class PluginScriptless {
  constructor (jotted, options) {
    options = util.extend(options, {})

    // https://html.spec.whatwg.org/multipage/scripting.html
    var runScriptTypes = [
      'application/javascript',
      'application/ecmascript',
      'application/x-ecmascript',
      'application/x-javascript',
      'text/ecmascript',
      'text/javascript',
      'text/javascript1.0',
      'text/javascript1.1',
      'text/javascript1.2',
      'text/javascript1.3',
      'text/javascript1.4',
      'text/javascript1.5',
      'text/jscript',
      'text/livescript',
      'text/x-ecmascript',
      'text/x-javascript'
    ]

    // remove script tags on each change
    jotted.on('change', this.change.bind(this))

    // public
    this.runScriptTypes = runScriptTypes
  }

  change (params, callback) {
    if (params.type !== 'html') {
      return callback(null, params)
    }

    // for IE9 support, remove the script tags from HTML content.
    // when we stop supporting IE9, we can use the sandbox attribute.
    var fragment = document.createElement('div')
    fragment.innerHTML = params.content

    var typeAttr = null

    // remove all script tags
    var $scripts = fragment.querySelectorAll('script')
    for (let i = 0; i < $scripts.length; i++) {
      typeAttr = $scripts[i].getAttribute('type')

      // only remove script tags without the type attribute
      // or with a javascript mime attribute value.
      // the ones that are run by the browser.
      if (!typeAttr || this.runScriptTypes.indexOf(typeAttr) !== -1) {
        $scripts[i].parentNode.removeChild($scripts[i])
      }
    }

    params.content = fragment.innerHTML

    callback(null, params)
  }
}
