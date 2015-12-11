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
  /* template
   */

  function container() {
    return "\n    <ul class=\"jotted-nav\">\n      <li class=\"jotted-nav-item jotted-nav-item-result\">\n        <a href=\"#\" data-jotted-type=\"result\">\n          Result\n        </a>\n      </li>\n      <li class=\"jotted-nav-item jotted-nav-item-html\">\n        <a href=\"#\" data-jotted-type=\"html\">\n          HTML\n        </a>\n      </li>\n      <li class=\"jotted-nav-item jotted-nav-item-css\">\n        <a href=\"#\" data-jotted-type=\"css\">\n          CSS\n        </a>\n      </li>\n      <li class=\"jotted-nav-item jotted-nav-item-js\">\n        <a href=\"#\" data-jotted-type=\"js\">\n          JavaScript\n        </a>\n      </li>\n    </ul>\n    <div class=\"jotted-pane jotted-pane-result\">\n      <iframe></iframe>\n    </div>\n    <div class=\"jotted-pane jotted-pane-html\"></div>\n    <div class=\"jotted-pane jotted-pane-css\"></div>\n    <div class=\"jotted-pane jotted-pane-js\"></div>\n  ";
  }

  function paneActiveClass(type) {
    return "jotted-pane-active-" + type;
  }

  function containerClass() {
    return "jotted";
  }

  function showBlankClass() {
    return "jotted-show-blank";
  }

  function hasFileClass(type) {
    return "jotted-has-" + type;
  }

  function editorClass(type) {
    return "jotted-editor jotted-editor-" + type;
  }

  function editorContent(type, file) {
    return "\n    <textarea data-jotted-type=\"" + type + "\" data-jotted-file=\"" + file + "\"></textarea>\n  ";
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

  function seqRunner(index, params, arr, callback) {
    arr[index](params, function (err, res) {
      if (err) {
        return console.log(err);
      }

      index++;
      if (index === arr.length) {
        callback(err, res);
      } else {
        seqRunner(index, res, arr, callback);
      }
    });
  }

  function seq(arr, params, callback) {
    if (!arr.length) {
      return callback(null, params);
    }

    seqRunner(0, params, arr, callback);
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  var plugins = [];

  function find(id) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var plugin = _step.value;

        if (plugin._id === id) {
          return plugin;
        }
      }

      // can't find plugin
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    throw new Error('Plugin ' + id + ' is not registered.');
  }

  function register(id, plugin) {
    // private properties
    plugin._id = id;
    // default priority
    plugin.priority = plugin.priority || 90;
    plugins.push(plugin);

    // sort plugins on priority
    plugins.sort(function (a, b) {
      return a.priority > b.priority ? 1 : b.priority > a.priority ? -1 : 0;
    });
  }

  // parallel init all plugins
  function init() {
    for (var id in this.options.plugins) {
      find(id).init.call(this, this.options.plugins[id]);
    }
  }

  // sequentially runs a method on all plugins
  function run(method) {
    var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

    var runIdList = Object.keys(this.options.plugins).map(function (id) {
      return id;
    });
    var runList = [];

    runIdList.forEach(function (id, index) {
      var plugin = find(id);
      if (typeof plugin[method] !== 'undefined') {
        runList.push(plugin[method]);
      }
    });

    seq(runList, params, function (err, res) {
      callback(err, res);
    });
  }

  var editor;
  var $textarea;

  var PluginAce = (function () {
    function PluginAce() {
      babelHelpers.classCallCheck(this, PluginAce);

      this.priority = 99;
    }

    babelHelpers.createClass(PluginAce, [{
      key: 'init',
      value: function init(opts) {
        var _this = this;

        this.pluginOptions = extend(opts, {});

        // check if ace is loaded
        if (typeof window.ace === 'undefined') {
          return;
        }

        this.$container.classList.add('jotted-plugin-ace');

        var $aceHTML = document.createElement('div');

        var $editor = this.$html.querySelector('.jotted-editor');

        $editor.appendChild($aceHTML);
        editor = window.ace.edit($aceHTML);
        editor.setOptions({
          mode: 'ace/mode/html'
        });

        $textarea = $editor.querySelector('textarea');

        //     this.$container.removeEventListener('change', this.debounceChange)
        //     this.$container.removeEventListener('keyup', this.debounceChange)

        editor.on('change', function () {
          console.log('change');
          $textarea.value = editor.getValue();

          _this.change({
            target: $textarea
          });

          //       $textarea.change()
        });

        //     editor.setValue($textarea.value)

        //     editor.getSession().setValue('tesgfhfghfghfghgfht')

        // `this` is the jotted instance
        //     console.log(this)

        // TODO check if ace is loaded, if it is, use it on the textareas
      }
    }, {
      key: 'html',
      value: function html(params, callback) {
        editor.setValue($textarea.value);

        setTimeout(function () {
          callback(null, params);
        }, 500);
      }
    }]);
    return PluginAce;
  })();

  var editor$1;
  var $textarea$1;
  var cmChange = false;

  var PluginCodeMirror = (function () {
    function PluginCodeMirror() {
      babelHelpers.classCallCheck(this, PluginCodeMirror);

      this.priority = 99;
    }

    babelHelpers.createClass(PluginCodeMirror, [{
      key: 'init',
      value: function init(opts) {
        this.pluginOptions = extend(opts, {});

        // check if CodeMirror is loaded
        if (typeof window.CodeMirror === 'undefined') {
          return;
        }

        this.$container.classList.add('jotted-plugin-codemirror');

        var $editor = this.$html.querySelector('.jotted-editor');
        $textarea$1 = $editor.querySelector('textarea');

        editor$1 = window.CodeMirror.fromTextArea($editor.querySelector('textarea'), {
          lineNumbers: true
        });

        editor$1.on('change', function () {
          cmChange = true;
          $textarea$1.value = editor$1.getValue();

          // TODO replace with .trigger
          var change = new window.Event('change', {
            bubbles: true
          });
          $textarea$1.dispatchEvent(change);
        });
      }

      // TODO replace with .on

    }, {
      key: 'html',
      value: function html(params, callback) {
        // TODO check if the event was triggered from the codemirror change
        if (!cmChange) {
          editor$1.setValue($textarea$1.value);
        }

        setTimeout(function () {
          cmChange = false;
          params.content = editor$1.getValue();
          callback(null, params);
        }, 500);
      }
    }]);
    return PluginCodeMirror;
  })();

  var Jotted = (function () {
    function Jotted($editor, opts) {
      babelHelpers.classCallCheck(this, Jotted);

      this.options = extend(opts, {
        showBlank: false,
        pane: 'result',
        debounce: 250,
        plugins: {
          ace: {}
        }
      });

      this.$container = $editor;
      this.$container.innerHTML = container();
      this.$container.classList.add(containerClass());

      if (this.options.showEmpty) {
        this.$container.classList.add(showBlankClass());
      }

      // default pane
      this.paneActive = this.options.pane;
      this.$container.classList.add(paneActiveClass(this.paneActive));

      this.$result = $editor.querySelector('.jotted-pane-result');
      this.$html = $editor.querySelector('.jotted-pane-html');
      this.$css = $editor.querySelector('.jotted-pane-css');
      this.$js = $editor.querySelector('.jotted-pane-js');

      this.markup('html', this.$html);
      this.markup('css', this.$css);
      this.markup('js', this.$js);

      this.$resultFrame = this.$result.querySelector('iframe');

      this.$styleInject = document.createElement('style');
      this.$resultFrame.contentWindow.document.head.appendChild(this.$styleInject);

      // change events
      this.$container.addEventListener('change', debounce(this.change.bind(this), this.options.debounce));
      this.$container.addEventListener('keyup', debounce(this.change.bind(this), this.options.debounce));

      // pane change
      this.$container.addEventListener('click', this.pane.bind(this));

      // init plugins
      init.call(this);
    }

    babelHelpers.createClass(Jotted, [{
      key: 'markup',
      value: function markup(type, $parent) {
        var _this = this;

        // create the markup for an editor
        var file = this.$container.dataset[type] || '';

        var $editor = document.createElement('div');
        $editor.innerHTML = editorContent(type, file);
        $editor.className = editorClass(type);
        var $textarea = $editor.querySelector('textarea');

        $parent.appendChild($editor);

        if (file !== '') {
          this.$container.classList.add(hasFileClass(type));

          fetch(file, function (err, res) {
            if (err) {
              return;
            }

            $textarea.value = res;

            // simulate change event
            _this.change({
              target: $textarea
            });
          });
        }
      }
    }, {
      key: 'change',
      value: function change(e) {
        var _this2 = this;

        if (!e.target.dataset.jottedType) {
          return;
        }

        var type = e.target.dataset.jottedType;

        // run all plugins, then do magic
        run.call(this, type, {
          name: e.target.dataset.jottedFile,
          content: e.target.value
        }, function (err, res) {
          if (err) {
            return err;
          }

          if (type === 'html') {
            _this2.$resultFrame.contentWindow.document.body.innerHTML = res.content;
            return;
          }

          if (type === 'css') {
            _this2.$styleInject.textContent = res.content;
            return;
          }

          if (type === 'js') {
            // TODO plugin to show errors
            _this2.$resultFrame.contentWindow.eval(res.content);
            return;
          }
        });
      }
    }, {
      key: 'pane',
      value: function pane(e) {
        if (!e.target.dataset.jottedType) {
          return;
        }

        this.$container.classList.remove(paneActiveClass(this.paneActive));
        this.paneActive = e.target.dataset.jottedType;
        this.$container.classList.add(paneActiveClass(this.paneActive));

        e.preventDefault();
      }
    }]);
    return Jotted;
  })();

  // register plugins

  Jotted.plugin = function () {
    return register.apply(this, arguments);
  };

  // register bundled plugins
  // TODO create a new instance of each plugin on init
  Jotted.plugin('ace', new PluginAce());
  Jotted.plugin('codemirror', new PluginCodeMirror());

  return Jotted;

}));
//# sourceMappingURL=jotted.js.map