/* jotted
 */

// register bundled plugins
import PluginAce from './plugins/ace.js'
import PluginCodeMirror from './plugins/codemirror.js'
import PluginLess from './plugins/less.js'
import PluginCoffeeScript from './plugins/coffeescript.js'
import PluginStylus from './plugins/stylus.js'

export default function BundlePlugins (jotted) {
  jotted.plugin('codemirror', PluginCodeMirror)
  jotted.plugin('ace', PluginAce)
  jotted.plugin('less', PluginLess)
  jotted.plugin('coffescript', PluginCoffeeScript)
  jotted.plugin('stylus', PluginStylus)
}
