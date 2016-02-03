
## [1.1.3] - 2016-02-03

* Add mode detection with syntax highlighting in the CodeMirror plugin.

## [1.1.2] - 2016-02-02

* Prevent the codemirror and ace plugins from triggering the `change` event twice when initializing Jotted.
* Rewrite the iframe content write functionality, to use `srcset` in modern browsers, and src="javascript:'..'" in IE9 and older browsers without support for srcset. Helps performance and fixes issues with Firefox rendering a blank iframe when having an iframe inception.

## [1.1.1] - 2016-02-02

* Improve the core styles, so that the height is set on the container, instead of on the pane.
* Update the list of valid script tag type values, to contain the full list from the HTML spec.
* Fix issues with the demos on the site not working on Firefox because of inconsistent base tag behavior.

## [1.1.0] - 2016-01-31

* New *bin* theme, for side by side editing. Use it with the `jotted-theme-bin` class on the container.
* Fix issues with the `showBlank` option not working correctly, and improve it's behavior by using all `-has-` file type classes, instead of the `show-blank` class.
* Add IE11 to the list of tested browsers.
* Remove MS Edge from the list of tested browsers, because manual tests work, but automated ones fail for no reason.
* CodeMirror plugin CSS layout improvements, by removing the `.jotted *` global `box-sizing: border-box` declaration that was overwriting CodeMirror styles.
* Document the `done` method, for use in plugins.

## [1.0.4] - 2016-01-22

* Add support for browser.js from babel-core 5.x, in the babel plugin. Use browser.js instead of babel-standalone, for IE9 support.
* Remove the default `presets` option in the babel plugin, because it's not supported by babel-core/browser.js.
* Change the way the iframe is rendered, by refreshing the entire iframe content on each change. The previous behavior was incorrect, and would maintain the DOM, even if the JS would change.
* Run the JavaScript from the JS pane only after all inline script tags are loaded, if runScripts is true.

## [1.0.3] - 2016-01-22

* Fix the script tag runner on Firefox.
* Run script tags only without the type attribute or with a standard value for it, to mimic browser behavior.
* Manually trigger DOMContentLoaded when all script tags finished loading, to mimic browser behavior. Fixes support for scripts relying on DOMContentLoaded.

## [1.0.2] - 2016-01-14

* Improvements to the npm package.json, to not install all files in the repo.

## [1.0.1] - 2016-01-14

* Clean-up unnecessary dependencies.

## [1.0.0] - 2016-01-14

* Release first version.
* Bundled plugins: ace, codemirror, babel, coffeescript, less, markdown, stylus.
* Features: plugin architecture, error-reporting, run scripts tags inside html, easily themeable.

