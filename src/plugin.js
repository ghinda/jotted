/* plugin
 */

import * as util from './util.js'
import * as template from './template.js'

var plugins = []

function find (id) {
  for (let pluginIndex in plugins) {
    let plugin = plugins[pluginIndex]
    if (plugin._id === id) {
      return plugin
    }
  }

  // can't find plugin
  throw new Error(`Plugin ${id} is not registered.`)
}

function register (id, plugin) {
  // private properties
  plugin._id = id
  plugins.push(plugin)
}

// create a new instance of each plugin, on the jotted instance
function init () {
  this._get('options').plugins.forEach((plugin) => {
    // check if plugin definition is string or object
    let Plugin
    let pluginName
    let pluginOptions = {}
    if (typeof plugin === 'string') {
      pluginName = plugin
    } else if (typeof plugin === 'object') {
      pluginName = plugin.name
      pluginOptions = plugin.options || {}
    }

    Plugin = find(pluginName)
    this._get('plugins')[plugin] = new Plugin(this, pluginOptions)

    util.addClass(this._get('$container'), template.pluginClass(pluginName))
  })
}

export {
  register,
  init
}
