/* bundle plugins
 */

// register bundled plugins
import PluginRender from './plugins/render.js'
import PluginScriptless from './plugins/scriptless.js'

import PluginAce from './plugins/ace.js'
import PluginCodeMirror from './plugins/codemirror.js'
import PluginLess from './plugins/less.js'
import PluginCoffeeScript from './plugins/coffeescript.js'
import PluginStylus from './plugins/stylus.js'
import PluginBabel from './plugins/babel.js'
import PluginMarkdown from './plugins/markdown.js'
import PluginConsole from './plugins/console.js'
import PluginPlay from './plugins/play.js'
import PluginColExpand from './plugins/colexpand.js'

export default function BundlePlugins (jotted) {
  jotted.plugin('render', PluginRender)
  jotted.plugin('scriptless', PluginScriptless)

  jotted.plugin('ace', PluginAce)
  jotted.plugin('codemirror', PluginCodeMirror)
  jotted.plugin('less', PluginLess)
  jotted.plugin('coffeescript', PluginCoffeeScript)
  jotted.plugin('stylus', PluginStylus)
  jotted.plugin('babel', PluginBabel)
  jotted.plugin('markdown', PluginMarkdown)
  jotted.plugin('console', PluginConsole)
  jotted.plugin('play', PluginPlay)
  jotted.plugin('colexpand', PluginColExpand)
}
