## [1.5.2] - 2017-11-20

* Fix issues with the results pane disappearing in some cases (eg. when not using CodeMirror), in the Pen plugin.

## [1.5.1] - 2016-11-07

* Fix issues with generating the resize handler for non-resizable panes, in the Pen plugin.

## [1.5.0] - 2016-11-04

* New `Pen` plugin - different layout with the result on top, and side by side, resizable columns.

## [1.4.5] - 2016-10-18

* Fix issues with loading scripts multiple times on changes. Caused by the iframe not removing them from memory when using document.write. Fixed by re-creating the iframe on each change.

## [1.4.3] - 2016-10-09

* Fix issues with randomly rendering the Result iframe blank in Chrome, caused by inconsistent `srcdoc` behavior. Use `document.write` instead, in all modern browsers.

## [1.4.2] - 2016-03-15

* Prevent malformed HTML from breaking JavaScript execution, and displaying the script content as text.

## [1.4.1] - 2016-03-14

* Fix issues with not triggering the initial change event when loading file content, when using content: ''.

## [1.4.0] - 2016-03-04

* New `firstRun` option (default is `true`) to the `play` plugin. Causes the preview to start with blank content, and only run the initial content on the first Run button press.

## [1.3.1] - 2016-02-29
* Fix compatibility issues between the Console and Play plugins.
* Make sure we don't insert the console.log capture snippet multiple times.
* Always force rendering when pressing the Run button in the Play plugin, even if the content hasn't changed.
* Don't clear the console with autoClear unless content has changed, or forceRender was used.


## [1.3.0] - 2016-02-24

* New Play plugin. Adds a Run button on the nav bar and stops auto-run for code changes. Clicking the Run button will update the iframe preview with the latest code.
* New `autoClear: true` option for the Console plugin, to clear the console on each change.
* Add a slight gradient to the buttons used by plugins.
* Listen to the `change` event on the textareas. Fixes issues with changing text without triggering `keyup` (cut/paste/blur).
* Improvements to the change event debouncers. Fixes issues with change events with different `type`s being debounced as the same event.
* Refactor the render the runScripts functionality as two separate plugins.
* Lots of improvements to the rendering pipeline. `done('change', ..)` will now always trigger once the preview iframe dom has been rendered.
* Don't re-render the preview iframe if the new change event has the same content as the one already rendered.
* When using `runScripts: false`, only remove script tags without a type attribute or with a valid JavaScript mime-type. These are the ones that would be executed by the browser.
* Prevent the change event from triggering on the textareas when the content is the same.


## [1.2.1] - 2016-02-11

* White background for the Console pane, and more styling tweaks.

## [1.2.0] - 2016-02-11

* New Console plugin, for a lightweight JavaScript console similar to the one in the browser (or on JS Bin/CodePen). Includes history support when pressing Up and Down keys.
* Remove the `change` handler on textareas, to not trigger another render on focusing-out the textareas.
* Replace Jasmine with Mocha+Chai for testing.

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

