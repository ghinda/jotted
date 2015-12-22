/* plugin
 */

var plugins = []

function find (id) {
  for (let plugin of plugins) {
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
  for (let plugin of this.options.plugins) {
    // check if plugin definition is string or object
    let Plugin
    let pluginOptions = {}
    if (typeof plugin === 'string') {
      Plugin = find(plugin)
    } else if (typeof plugin === 'object') {
      Plugin = find(plugin.name)
      pluginOptions = plugin.options || {}
    }

    this.plugins[plugin] = new Plugin(this, pluginOptions)
  }
}

export {
  register,
  init
}
