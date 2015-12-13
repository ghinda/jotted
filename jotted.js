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

  function seq(arr, params) {
    var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

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

  function log() {
    console.log(arguments);
  }

  var topics = {};

  function find$1(query) {
    topics[query] = topics[query] || [];
    return topics[query];
  }

  function subscribe(topic, subscriber) {
    var priority = arguments.length <= 2 || arguments[2] === undefined ? 90 : arguments[2];

    var foundTopic = find$1(topic);
    subscriber._priority = priority;
    foundTopic.push(subscriber);

    // sort subscribers on priority
    foundTopic.sort(function (a, b) {
      return a._priority > b._priority ? 1 : b._priority > a._priority ? -1 : 0;
    });
  }

  function unsubscribe(topic, subscriber) {
    var foundTopic = find$1(topic);
    foundTopic.forEach(function (t) {
      // if no subscriber is specified
      // remove all subscribers
      if (!subscriber) {
        t.length = 0;
        return;
      }

      // find the subscriber in the topic
      var index = [].indexOf.call(t, subscriber);

      // show an error if we didn't find the subscriber
      if (index === -1) {
        return log('Subscriber not found in topic');
      }

      t.splice(index, 1);
    });
  }

  // sequentially runs a method on all plugins
  function publish(topic) {
    var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var foundTopic = find$1(topic);
    var runList = [];

    foundTopic.forEach(function (subscriber) {
      runList.push(subscriber);
    });

    seq(runList, params);
  }

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

  /* plugin
   */

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

    throw new Error("Plugin " + id + " is not registered.");
  }

  function register(id, plugin) {
    // private properties
    plugin._id = id;
    plugins.push(plugin);
  }

  // create a new instance of each plugin, on the jotted instance
  function init() {
    for (var id in this.options.plugins) {
      var Plugin = find(id);
      this.plugins[id] = new Plugin(this, this.options.plugins[id]);
    }
  }

  var PluginCodeMirror = (function () {
    function PluginCodeMirror(jotted, options) {
      var _this = this;

      babelHelpers.classCallCheck(this, PluginCodeMirror);

      var priority = 90;
      var i;
      this.chChange = false;

      this.editorHTML = {};
      this.editorCSS = {};
      this.editorJS = {};

      this.textareaHTML = {};
      this.textareaCSS = {};
      this.textareaJS = {};

      options = extend(options, {});

      // check if CodeMirror is loaded
      if (typeof window.CodeMirror === 'undefined') {
        return;
      }

      jotted.$container.classList.add('jotted-plugin-codemirror');

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      var _loop = function _loop() {
        var $editor = $editors[i];
        var $textarea = $editor.querySelector('textarea');
        var type = $textarea.dataset.jottedType;

        editor = window.CodeMirror.fromTextArea($editor.querySelector('textarea'), {
          lineNumbers: true
        });

        editor.on('change', function () {
          _this.cmChange = true;
          $textarea.value = editor.getValue();

          // TODO get real data form the editor
          jotted.trigger('change', {
            type: 'html',
            name: 'test.html',
            content: $textarea.value
          });
        });

        if (type === 'html') {
          _this.editorHTML = editor;
          _this.$textareaHTML = $textarea;
        }

        if (type === 'css') {
          _this.editorCSS = editor;
          _this.$textareaCSS = $textarea;
        }

        if (type === 'js') {
          _this.editorJS = editor;
          _this.$textareaJS = $textarea;
        }
      };

      for (i = 0; i < $editors.length; i++) {
        var editor;

        _loop();
      }

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginCodeMirror, [{
      key: 'change',
      value: function change(params, callback) {
        var editor = this.editorHTML;

        if (params.type === 'css') {
          editor = this.editorCSS;
        }

        if (params.type === 'js') {
          editor = this.editorJS;
        }

        // TODO check if the event was triggered from the codemirror change
        if (!this.cmChange) {
          editor.setValue(params.content);
        }

        setTimeout(function () {
          this.cmChange = false;
          params.content = editor.getValue();
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

      this.plugins = {};

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

      this.on('change', this.changeCallback.bind(this), 999);
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
        if (!e.target.dataset.jottedType) {
          return;
        }

        this.trigger('change', {
          type: e.target.dataset.jottedType,
          name: e.target.dataset.jottedFile,
          content: e.target.value
        });
      }
    }, {
      key: 'changeCallback',
      value: function changeCallback(params, callback) {
        if (params.type === 'html') {
          this.$resultFrame.contentWindow.document.body.innerHTML = params.content;
          return;
        }

        if (params.type === 'css') {
          this.$styleInject.textContent = params.content;
          return;
        }

        if (params.type === 'js') {
          // TODO plugin to show errors
          this.$resultFrame.contentWindow.eval(params.content);
          return;
        }
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
    }, {
      key: 'on',
      value: function on() {
        subscribe.apply(this, arguments);
      }
    }, {
      key: 'off',
      value: function off() {
        unsubscribe.apply(this, arguments);
      }
    }, {
      key: 'trigger',
      value: function trigger() {
        publish.apply(this, arguments);
      }
    }]);
    return Jotted;
  })();

  // register plugins

  Jotted.plugin = function () {
    return register.apply(this, arguments);
  };

  // register bundled plugins
  Jotted.plugin('codemirror', PluginCodeMirror);

  return Jotted;

}));
//# sourceMappingURL=jotted.js.map