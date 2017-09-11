# Jotted

[![Build Status](https://api.travis-ci.org/ghinda/jotted.svg)](https://travis-ci.org/ghinda/jotted)

Environment for showcasing HTML, CSS and JavaScript, with editable source. It's like [JSFiddle](https://jsfiddle.net/)  or [JS Bin](http://jsbin.com/) for self-hosted demos.

## Install

* [npm](https://www.npmjs.com/package/jotted): `npm install --save jotted`
* [Bower](http://bower.io/): `bower install --save jotted`
* [jsDelivr](https://www.jsdelivr.com/projects/jotted):

``` html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/jotted@latest/jotted.min.css">
<script src="https://cdn.jsdelivr.net/npm/jotted@latest/jotted.min.js"></script>
```

## Features

* **Lightweight:** No dependencies, uses `textarea`s for editing by default.
* **Plugins:** Flexible plugin architecture for custom editors, preprocessors or anything else.
* **Code editors:** Includes plugins for code editors like [Ace](https://ace.c9.io/) and [CodeMirror](https://codemirror.net/).
* **Preprocessors:** Includes plugins for preprocessors (ES6, CoffeeScript, Less, Stylus, Markdown).

## How to use

### Quick use

```html
<link rel="stylesheet" href="jotted.css">
<script src="jotted.js"></script>

<div id="editor"></div>
<script>
  new Jotted(document.querySelector('#editor'), {
    files: [{
      type: 'html',
      url: 'index.html'
    }]
  })
</script>
```


### Options

Initialize Jotted with `new Jotted(elementNode, optionsHash)`.

The first argument is a DOM container where the editor will be created. The second argument is a hash of options.

Available options are:

#### files
Type: `Array`
Default: `[]`

Array of `Object`s specifying files that will be loaded. Objects inside the array must follow this pattern:

```javascript
{
  type: "html", // can be "html", "css", or "js"
  url: "/index.html", // load the file from a url (restricted by the same-domain policy), OR
  content: "<h1>HTML Content</h1>" // insert file content as string
}
```

Use either `url` or `content`, not both.

#### showBlank
Type: `Boolean`
Default: `false`

Specifies if panes/tabs without content/files should be visible.

#### runScripts
Type: `Boolean`
Default: `true`

Specifies if script tags inside HTML content should be ran.

#### pane
Type: `String`
Default: `result`

Specifies which pane/tab should be the default one opened. Can be `result`, `html`, `css` or `js`.

#### debounce
Type: `Number`
Default: 250

Sets the debounce interval used by the `change` event (eg. render changes in the Result pane after a change in an editor).

#### plugins
Type: `Array`
Default: []

Array of `String`s or `Object`s setting the plugins used by this editor instance.

If `String`, specify plugin name.

If `Object`, follow this pattern:

```javascript
{
  name: 'less', // plugin name
  options: {} // options hash to be passed to plugin
}
```


### Example

```javascript
new Jotted(document.querySelector('#demo'), {
  files: [{
    type: 'css',
    url: 'index.styl'
  }, {
    type: 'html',
    content: '<h1>Demo</h1>'
  }],
  showBlank: true,
  plugins: [
    'stylus',
    {
      name: 'codemirror',
      options: {
        lineNumbers: false
      }
    }
  ]
```


## Plugins

### Editors

* `ace`: Uses the [Ace](https://ace.c9.io/) editor if it's available.
* `codemirror`: Uses the [CodeMirror](https://codemirror.net/) editor if it's available.

### Preprocessors

* `babel`: Compiles ES6 to ES5 with [Babel](https://babeljs.io/).
* `coffeescript`: Compiles [CoffeeScript](http://coffeescript.org/).
* `less`: Compiles [Less](http://lesscss.org/).
* `markdown`: Compiles Markdown using [marked](https://github.com/chjj/marked).
* `stylus`: Compiles [Stylus](http://stylus-lang.com/).

### Other

* `console`: Lightweight JavaScript console, similar to the one in the browser's developer tools.


## Plugin API

You can quickly create Jotted plugins with:

```javascript
Jotted.plugin('demoPlugin', function (jotted, options) {
  // do stuff
});
```

A plugin is a constructor function that will be called with `new` when a Jotted instance using the plugin is initialized.

The plugin function gets two arguments:

* The first argument is the current Jotted instance.
* The second argument is the plugin's hash of options.

### Events API

The Jotted instance exposes a PubSub-like API, for attaching custom plugin-specific events.

#### on (eventName, function(params, callback) {}, priority)

Use the `on` method to attach methods to an event.

* The first argument is a `String` event name. Jotted only uses the `change` event internally.

* The second argument is a subscriber `Function`.

Unlike most PubSub systems, subscriber functions are run sequentially, not in parallel. This allows a function to modify the parameters received from a different, previously run, function, and pass them on.

The functions gets two arguments. The first one is a hash with the format:

```javascript
{
  file: 'index.html', // changed file's url, if specified
  content: '<h1>Demo</h1>' // file's content
}
```

The second one is a callback that should be called with two arguments: an error object, if there was an error, and the `params` object received by the subscriber.

You can modify the `params` object before sending it with the callback.

```javascript
jotted.on('change', function (params, callback) {
  params.content += 'Content added by plugin.'
  callback(null, params)
})
```

**Remember to always call the `callback` in the function, or the queue will break.**

* The third argument is an optional `Number`, specifying the function's place in the queue. Functions are sorted based on their priority. If the priority is not specified, the method will be placed at the end of the queue.


#### off (eventName, subscriberFunction)

Use the `off` method to remove a subscriber function from an event.

```javascript
var subscriber = function (params, callback) {}
jotted.on('change', subscriber)
jotted.off('change', subscriber)
```

#### trigger (eventName, params)

Use the `trigger` method to trigger the function queue on an event.

The first argument is the event name, while the second is the `params` hash sent to the attached subscriber functions.

```javascript
jotted.trigger('change', {
  type: 'html', // can be 'html', 'css' or 'js'
  file: 'index.html', // file url
  content: '<h1>Demo</h1>' // file content
})
```

#### done (eventName, function(errors, params) {})

Use the `done` method to trigger a function once an event queue has finished.

The first argument is the event name, while the second is a `Function` receiving an `Array` of errors and the `params` hash.

```javascript
jotted.done('done', function (errs, params) {
  if (errs.length) {
    // show errors
  }
})
```


### Examples

For a preprocessor plugin, see the [less](src/plugins/less.js) plugin.

For a code editor plugin, see the [codemirror](src/plugins/codemirror.js) plugin.


## Browser support

* Internet Explorer 9+
* Modern browsers


## Contributing

* Install [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/).
* Install [grunt-cli](https://www.npmjs.com/package/grunt-cli).
* Run `npm install` in the project folder.
* Run `grunt server` for a live-reload server with everything you need.
* Use ES2015.
* Follow the [JavaScript Standard Style](https://github.com/feross/standard).
* Send pull requests.
* Thanks! :beers:


## Who's using it

* [educative.io](https://www.educative.io/)


## License

Jotted is licensed under the [MIT license](LICENSE).

