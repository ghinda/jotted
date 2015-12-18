# Jotted

Jotted is an environment for showcasing HTML, CSS and JavaScript, with editable source. It's like [JS Bin](http://jsbin.com/) for self-hosted demos.

## Install

* [npm](https://www.npmjs.com/package/jotted): `npm install --save jotted`
* [Bower](http://bower.io/): `bower install --save jotted`

## Features

* **Lightweight:** No dependencies, uses `textareas` for editing by default.
* **Plugins:** Everything is a plugin. Include only what you need.
* **Code editors:** Has plugins for code editors like [Ace]() and [CodeMirror]().
* **Preprocessors:** Support for preprocessors (CoffeeScript, Less, Stylus, etc.)
* **Themes and Layouts:**: Customize the look and layout.
* **Share edits:** Edit exiting code, and share it with others.

## How to use

### Quick use

```
<div id="myDemo" data-html="index.html"></div>
<script>
  new Jotted(document.getElementById('myDemo'))
</script>
```

### API

`TODO`

## Plugins

### Editors

* `ace`: Uses the `Ace` code editor if it's available.
* `codemirror`: Uses the `CodeMirror` code editor if it's available.

### Preprocessors

* `coffeescript`: Compiles [CoffeeScript]().
* `less`: Compiles [Less]().
* `stylus`: Compiles [Stylus](). **WIP**

### Other

* `share`: Creates a shareable URL of the edited snapshot. **WIP**
* `store`: Stores the edited code in `localStorage`. **WIP**

## Plugin API

`TODO`

## Browser support

`IE9+` and modern browsers.

## License

Jotted is licensed under the [MIT license](LICENSE).

