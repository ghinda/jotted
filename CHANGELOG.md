
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

