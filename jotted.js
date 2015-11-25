(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.Jotted = factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  babelHelpers;
  /* plugin
   */

  function register(id, plugin) {
    this.plugins[id] = plugin;
  }

  /* util
   */

  function extend() {
    var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var defaults = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var extended = {};
    Object.keys(defaults).forEach(function (key) {
      if (typeof obj[key] !== 'undefined') {
        extended[key] = obj[key];
      } else {
        extended[key] = defaults[key];
      }
    });

    return extended;
  }

  function fetch(file, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', file);
    xhr.responseType = 'text';

    xhr.onload = function () {
      callback(null, xhr.response);
    };

    xhr.onerror = function (err) {
      callback(err);
    };

    xhr.send();
  }

  /* template
   */

  function container() {
    return "\n    <ul class=\"jotted-nav\">\n      <li>\n        <a href=\"#\">\n          Result\n        </a>\n      </li>\n      <li>\n        <a href=\"#\">\n          HTML\n        </a>\n      </li>\n      <li>\n        <a href=\"#\">\n          CSS\n        </a>\n      </li>\n    </ul>\n    <div class=\"jotted-pane jotted-pane-result\">\n      <iframe></iframe>\n    </div>\n    <div class=\"jotted-pane jotted-pane-html\"></div>\n    <div class=\"jotted-pane jotted-pane-css\"></div>\n    <div class=\"jotted-pane jotted-pane-js\"></div>\n  ";
  }

  function editorClass(type, id) {
    return "jotted-editor-" + type + " jotted-editor-" + type + "--" + id;
  }

  function editorContent() {
    return "\n    <textarea></textarea>\n  ";
  }

  /* ace plugin
   */

  var PluginAce = (function () {
    function PluginAce() {
      babelHelpers.classCallCheck(this, PluginAce);
    }

    babelHelpers.createClass(PluginAce, [{
      key: "init",
      value: function init(opts) {
        // `this` is the jotted instance
        //     console.log(this)

        // TODO check if ace is loaded, if it is, use it on the textareas
      }
    }, {
      key: "html",
      value: function html(file) {
        console.log(file);
      }
    }]);
    return PluginAce;
  })();

  var Jotted = (function () {
    function Jotted($editor, opts) {
      babelHelpers.classCallCheck(this, Jotted);

      this.plugins = {};
      this.options = extend(opts, {
        showEmpty: false,
        plugins: {
          ace: {}
        }
      });

      this.$container = $editor;
      this.$container.innerHTML = container();

      if (this.options.showEmpty) {
        this.$container.classList.add('jotted-show-empty');
      }

      this.$result = $editor.querySelector('.jotted-pane-result');
      this.$html = $editor.querySelector('.jotted-pane-html');
      this.$css = $editor.querySelector('.jotted-pane-css');
      this.$js = $editor.querySelector('.jotted-pane-js');

      this.dom('html', this.$html);
      this.dom('css', this.$css);
      this.dom('js', this.$js);

      this.$resultFrame = this.$result.querySelector('iframe');

      this.$styleInject = document.createElement('style');
      this.$resultFrame.contentWindow.document.head.appendChild(this.$styleInject);

      // TODO debouncer
      this.$container.addEventListener('change', this.change.bind(this));
      this.$container.addEventListener('keyup', this.change.bind(this));

      // init plugins
      for (var pluginId in this.options.plugins) {
        var pluginInstance = new PluginAce();
        this.register(pluginId, pluginInstance);

        // plugin init, for dom manipulation, etc.
        pluginInstance.init.call(this, this.options.plugins[pluginId]);
      }
    }

    babelHelpers.createClass(Jotted, [{
      key: 'dom',
      value: function dom(type, $parent) {
        var files = [''];

        if (this.$container.dataset[type]) {
          files = this.$container.dataset[type].split(';');
        }

        files.forEach(function (file) {
          // add a blank container if we have no files of the type
          if (file.trim() === '') {
            file = 'blank';
          }

          var $editor = document.createElement('div');
          $editor.innerHTML = editorContent();
          $editor.className = editorClass(type, file);

          var $textarea = $editor.querySelector('textarea');
          $textarea.dataset.type = type;

          $parent.appendChild($editor);

          if (file !== 'blank') {
            fetch(file, function (err, res) {
              if (err) {
                return;
              }

              $textarea.value = res;
              // TODO trigger change events
            });
          }
        });
      }
    }, {
      key: 'change',
      value: function change(e) {
        if (e.target.tagName.toLowerCase() !== 'textarea') {
          return;
        }

        // TODO check type and run plugins, then do magic

        var type = e.target.dataset.type;

        if (type === 'html') {
          this.$resultFrame.contentWindow.document.body.innerHTML = e.target.value;
          return;
        }

        if (type === 'css') {
          this.$styleInject.textContent = e.target.value;
          return;
        }

        if (type === 'js') {
          // TODO plugin to show errors
          this.$resultFrame.contentWindow.eval(e.target.value);
          return;
        }
      }

      // register plugins

    }, {
      key: 'register',
      value: function register$$() {
        return register.apply(this, arguments);
      }
    }]);
    return Jotted;
  })();

  return Jotted;

}));