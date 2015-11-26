/* plugin
 */

import * as util from './util.js'

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
  // default priority
  plugin.priority = plugin.priority || 90
  plugins.push(plugin)

  // sort plugins on priority
  plugins.sort(function (a, b) {
    return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0)
  })
}

// parallel init all plugins
function init () {
  for (let id in this.options.plugins) {
    find(id).init(this.options.plugins[id])
  }
}

// sequentially runs a method on all plugins
function run (method, params = {}, callback = function () {}) {
  var runIdList = Object.keys(this.options.plugins).map(id => id)
  var runList = []

  runIdList.forEach((id, index) => {
    var plugin = find(id)
    if (typeof plugin[method] !== 'undefined') {
      runList.push(plugin[method])
    }
  })

  util.seq(runList, params, (err, res) => {
    callback(err, res)
  })
}

export {
  register,
  init,
  run
}
