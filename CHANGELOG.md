
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

