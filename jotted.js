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
    return "\n    <textarea data-jotted-type=\"" + type + "\" data-jotted-file=\"" + file + "\"></textarea>\n    <div class=\"jotted-error\"></div>\n  ";
  }

  function errorMessage(err) {
    return "\n    <p>" + err + "</p>\n  ";
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
      if (xhr.status === 200) {
        callback(null, xhr.response);
      } else {
        callback(xhr);
      }
    };

    xhr.onerror = function (err) {
      callback(err);
    };

    xhr.send();
  }

  function runCallback(index, params, arr, errors, callback) {
    return function (err, res) {
      if (err) {
        errors.push(err);
      }

      index++;
      if (index === arr.length) {
        callback(errors, res);
      } else {
        seqRunner(index, res, arr, errors, callback);
      }
    };
  }

  function seqRunner(index, params, arr, errors, callback) {
    // async
    arr[index](params, runCallback.apply(this, arguments));
  }

  function seq(arr, params) {
    var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

    var errors = [];

    if (!arr.length) {
      return callback(errors, params);
    }

    seqRunner(0, params, arr, errors, callback);
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var _this = this;

      var args = arguments;
      clearTimeout(timer);

      timer = setTimeout(function () {
        fn.apply(_this, args);
      }, delay);
    };
  }

  function log() {
    console.log(arguments);
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

  var PubSoup = (function () {
    function PubSoup() {
      babelHelpers.classCallCheck(this, PubSoup);

      this.topics = {};
      this.callbacks = {};
    }

    babelHelpers.createClass(PubSoup, [{
      key: 'find',
      value: function find(query) {
        this.topics[query] = this.topics[query] || [];
        return this.topics[query];
      }
    }, {
      key: 'subscribe',
      value: function subscribe(topic, subscriber) {
        var priority = arguments.length <= 2 || arguments[2] === undefined ? 90 : arguments[2];

        var foundTopic = this.find(topic);
        subscriber._priority = priority;
        foundTopic.push(subscriber);

        // sort subscribers on priority
        foundTopic.sort(function (a, b) {
          return a._priority > b._priority ? 1 : b._priority > a._priority ? -1 : 0;
        });
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(topic, subscriber) {
        var foundTopic = this.find(topic);
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

    }, {
      key: 'publish',
      value: function publish(topic) {
        var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var foundTopic = this.find(topic);
        var runList = [];

        foundTopic.forEach(function (subscriber) {
          runList.push(subscriber);
        });

        seq(runList, params, this.runCallbacks(topic));
      }

      // parallel run all .done callbacks

    }, {
      key: 'runCallbacks',
      value: function runCallbacks(topic) {
        var pub = this;
        return function () {
          pub.callbacks[topic] = pub.callbacks[topic] || [];

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = pub.callbacks[topic][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var c = _step.value;

              c.apply(this, arguments);
            }
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
        };
      }

      // attach a callback when a publish[topic] is done

    }, {
      key: 'done',
      value: function done(topic) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

        this.callbacks[topic] = this.callbacks[topic] || [];
        this.callbacks[topic].push(callback);
      }
    }]);
    return PubSoup;
  })();

  var PluginStylus = (function () {
    function PluginStylus(jotted, options) {
      babelHelpers.classCallCheck(this, PluginStylus);

      var priority = 20;

      this.editor = {};

      options = extend(options, {});

      // check if stylus is loaded
      if (typeof window.stylus === 'undefined') {
        return;
      }

      jotted.$container.classList.add('jotted-plugin-stylus');

      // change CSS link label to Stylus
      jotted.$container.querySelector('a[data-jotted-type="css"]').innerHTML = 'Stylus';

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginStylus, [{
      key: 'isStylus',
      value: function isStylus(params) {
        if (params.type !== 'css') {
          return false;
        }

        return params.file.indexOf('.styl') !== -1 || params.file === '';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse .styl and blank files
        if (this.isStylus(params)) {
          window.stylus(params.content, this.options).render(function (err, res) {
            if (err) {
              return callback(err, params);
            } else {
              // replace the content with the parsed less
              params.content = res;
            }

            callback(null, params);
          });
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginStylus;
  })();

  var PluginCoffeeScript = (function () {
    function PluginCoffeeScript(jotted, options) {
      babelHelpers.classCallCheck(this, PluginCoffeeScript);

      var priority = 20;

      this.editor = {};

      options = extend(options, {});

      // check if coffeescript is loaded
      if (typeof window.CoffeeScript === 'undefined') {
        return;
      }

      jotted.$container.classList.add('jotted-plugin-less');

      // change JS link label to Less
      jotted.$container.querySelector('a[data-jotted-type="js"]').innerHTML = 'CoffeeScript';

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginCoffeeScript, [{
      key: 'isCoffee',
      value: function isCoffee(params) {
        if (params.type !== 'js') {
          return false;
        }

        return params.file.indexOf('.coffee') !== -1 || params.file === '';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse .less and blank files
        if (this.isCoffee(params)) {
          try {
            params.content = window.CoffeeScript.compile(params.content);
          } catch (err) {
            return callback(err, params);
          }
        }

        callback(null, params);
      }
    }]);
    return PluginCoffeeScript;
  })();

  var PluginLess = (function () {
    function PluginLess(jotted, options) {
      babelHelpers.classCallCheck(this, PluginLess);

      var priority = 20;

      this.editor = {};

      options = extend(options, {});

      // check if less is loaded
      if (typeof window.less === 'undefined') {
        return;
      }

      jotted.$container.classList.add('jotted-plugin-less');

      // change CSS link label to Less
      jotted.$container.querySelector('a[data-jotted-type="css"]').innerHTML = 'Less';

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginLess, [{
      key: 'isLess',
      value: function isLess(params) {
        if (params.type !== 'css') {
          return false;
        }

        return params.file.indexOf('.less') !== -1 || params.file === '';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse .less and blank files
        if (this.isLess(params)) {
          window.less.render(params.content, this.options, function (err, res) {
            if (err) {
              return callback(err, params);
            } else {
              // replace the content with the parsed less
              params.content = res.css;
            }

            callback(null, params);
          });
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginLess;
  })();

  var PluginAce = (function () {
    function PluginAce(jotted, options) {
      var _this = this;

      babelHelpers.classCallCheck(this, PluginAce);

      var priority = 1;
      var i;

      this.editor = {};

      this.modemap = {
        'html': 'html',
        'css': 'css',
        'js': 'javascript',
        'less': 'less',
        'coffee': 'coffeescript'
      };

      options = extend(options, {});

      // check if Ace is loaded
      if (typeof window.ace === 'undefined') {
        return;
      }

      jotted.$container.classList.add('jotted-plugin-ace');

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      var _loop = function _loop() {
        var $textarea = $editors[i].querySelector('textarea');
        var type = $textarea.dataset.jottedType;
        var file = $textarea.dataset.jottedFile;

        var $aceContainer = document.createElement('div');
        $editors[i].appendChild($aceContainer);

        _this.editor[type] = window.ace.edit($aceContainer);
        var editor = _this.editor[type];

        var editorOptions = extend(options);

        editor.getSession().setMode(_this.aceMode(type, file));
        editor.getSession().setOptions(editorOptions);

        editor.$blockScrolling = Infinity;

        editor.on('change', function () {
          $textarea.value = editor.getValue();

          // trigger a change event
          jotted.trigger('change', {
            aceEditor: editor,
            type: type,
            file: file,
            content: $textarea.value
          });
        });
      };

      for (i = 0; i < $editors.length; i++) {
        _loop();
      }

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginAce, [{
      key: 'change',
      value: function change(params, callback) {
        var editor = this.editor[params.type];

        // if the event is not started by the ace change
        if (!params.aceEditor) {
          editor.getSession().setValue(params.content);
        }

        // manipulate the params and pass them on
        params.content = editor.getValue();
        callback(null, params);
      }
    }, {
      key: 'aceMode',
      value: function aceMode(type, file) {
        var mode = 'ace/mode/';

        // try the file extension
        for (var key in this.modemap) {
          if (file.indexOf('.' + key) !== -1) {
            return mode + this.modemap[key];
          }
        }

        // try the file type (html/css/js)
        for (var key in this.modemap) {
          if (type === key) {
            return mode + this.modemap[key];
          }
        }

        return mode + type;
      }
    }]);
    return PluginAce;
  })();

  var PluginCodeMirror = (function () {
    function PluginCodeMirror(jotted, options) {
      var _this = this;

      babelHelpers.classCallCheck(this, PluginCodeMirror);

      var priority = 1;
      var i;

      this.editor = {};

      options = extend(options, {
        lineNumbers: true
      });

      // check if CodeMirror is loaded
      if (typeof window.CodeMirror === 'undefined') {
        return;
      }

      jotted.$container.classList.add('jotted-plugin-codemirror');

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      var _loop = function _loop() {
        var $textarea = $editors[i].querySelector('textarea');
        var type = $textarea.dataset.jottedType;
        var file = $textarea.dataset.jottedFile;

        _this.editor[type] = window.CodeMirror.fromTextArea($textarea, options);
        var editor = _this.editor[type];

        editor.on('change', function () {
          $textarea.value = editor.getValue();

          // trigger a change event
          jotted.trigger('change', {
            cmEditor: editor,
            type: type,
            file: file,
            content: $textarea.value
          });
        });
      };

      for (i = 0; i < $editors.length; i++) {
        _loop();
      }

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginCodeMirror, [{
      key: 'change',
      value: function change(params, callback) {
        var editor = this.editor[params.type];

        // if the event is not started by the codemirror change
        if (!params.cmEditor) {
          editor.setValue(params.content);
        }

        // manipulate the params and pass them on
        params.content = editor.getValue();
        callback(null, params);
      }
    }]);
    return PluginCodeMirror;
  })();

  function BundlePlugins(jotted) {
    jotted.plugin('codemirror', PluginCodeMirror);
    jotted.plugin('ace', PluginAce);
    jotted.plugin('less', PluginLess);
    jotted.plugin('coffescript', PluginCoffeeScript);
    jotted.plugin('stylus', PluginStylus);
  }

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

      this.pubsoup = new PubSoup();

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
      this.$pane = {};
      this.$error = {};

      var _arr = ['html', 'css', 'js'];
      for (var _i = 0; _i < _arr.length; _i++) {
        var type = _arr[_i];
        this.$pane[type] = $editor.querySelector('.jotted-pane-' + type);
        this.markup(type, this.$pane[type]);

        this.$error[type] = this.$pane[type].querySelector('.jotted-error');
      }

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

      // debounced trigger method
      this.trigger = debounce(this.pubsoup.publish.bind(this.pubsoup), this.options.debounce);

      // done change on all subscribers,
      // render the results.
      this.done('change', this.changeCallback.bind(this));
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
              // TODO show load errors
              _this.error([err.responseText], {
                type: type,
                file: file
              });
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
          file: e.target.dataset.jottedFile,
          content: e.target.value
        });
      }
    }, {
      key: 'changeCallback',
      value: function changeCallback(err, params) {
        if (err) {
          this.error(err, params);
        }

        if (params.type === 'html') {
          this.$resultFrame.contentWindow.document.body.innerHTML = params.content;
          return;
        }

        if (params.type === 'css') {
          this.$styleInject.textContent = params.content;
          return;
        }

        if (params.type === 'js') {
          // catch and show js errors
          try {
            this.$resultFrame.contentWindow.eval(params.content);
          } catch (err) {
            this.error([err.message], {
              type: 'js'
            });
          }

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
        this.pubsoup.subscribe.apply(this.pubsoup, arguments);
      }
    }, {
      key: 'off',
      value: function off() {
        this.pubsoup.unsubscribe.apply(this.pubsoup, arguments);
      }
    }, {
      key: 'done',
      value: function done() {
        this.pubsoup.done.apply(this.pubsoup, arguments);
      }
    }, {
      key: 'error',
      value: function error(errors, params) {
        if (!errors.length) {
          return this.clearError(params);
        }

        this.$container.classList.add('jotted-error-active-' + params.type);

        var markup = '';
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = errors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var err = _step.value;

            markup += errorMessage(err);
          }
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

        this.$error[params.type].innerHTML = markup;
      }
    }, {
      key: 'clearError',
      value: function clearError(params) {
        this.$container.classList.remove('jotted-error-active-' + params.type);
        this.$error[params.type].innerHTML = '';
      }
    }]);
    return Jotted;
  })();

  // register plugins

  Jotted.plugin = function () {
    return register.apply(this, arguments);
  };

  BundlePlugins(Jotted);

  return Jotted;

}));
//# sourceMappingURL=jotted.js.map