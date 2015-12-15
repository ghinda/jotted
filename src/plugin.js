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
  for (let id in this.options.plugins) {
    var Plugin = find(id)
    this.plugins[id] = new Plugin(this, this.options.plugins[id])
  }
}

export {
  register,
  init
}
