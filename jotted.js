(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.Jotted = factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.typeof = function (obj) {
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

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
    return '\n    <ul class="jotted-nav">\n      <li class="jotted-nav-item jotted-nav-item-result">\n        <a href="#" data-jotted-type="result">\n          Result\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-html">\n        <a href="#" data-jotted-type="html">\n          HTML\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-css">\n        <a href="#" data-jotted-type="css">\n          CSS\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-js">\n        <a href="#" data-jotted-type="js">\n          JavaScript\n        </a>\n      </li>\n    </ul>\n    <div class="jotted-pane jotted-pane-result"></div>\n    <div class="jotted-pane jotted-pane-html"></div>\n    <div class="jotted-pane jotted-pane-css"></div>\n    <div class="jotted-pane jotted-pane-js"></div>\n  ';
  }

  function paneActiveClass(type) {
    return 'jotted-pane-active-' + type;
  }

  function containerClass() {
    return 'jotted';
  }

  function showBlankClass() {
    return 'jotted-nav-show-blank';
  }

  function hasFileClass(type) {
    return 'jotted-has-' + type;
  }

  function editorClass(type) {
    return 'jotted-editor jotted-editor-' + type;
  }

  function editorContent(type) {
    var fileUrl = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    return '\n    <textarea data-jotted-type="' + type + '" data-jotted-file="' + fileUrl + '"></textarea>\n    <div class="jotted-status"></div>\n  ';
  }

  function statusMessage(err) {
    return '\n    <p>' + err + '</p>\n  ';
  }

  function statusClass(type) {
    return 'jotted-status-' + type;
  }

  function statusActiveClass(type) {
    return 'jotted-status-active-' + type;
  }

  function pluginClass(name) {
    return 'jotted-plugin-' + name;
  }

  function frameContent() {
    var body = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    return '\n    <!doctype html>\n    <html>\n    <head>\n    </head>\n    <body>\n    ' + body + '\n    </body>\n    </html>\n  ';
  }

  function statusLoading(url) {
    return 'Loading <strong>' + url + '</strong>..';
  }

  function statusFetchError(url) {
    return 'There was an error loading <strong>' + url + '</strong>.';
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

  function fetch(url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'text';

    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(null, xhr.responseText);
      } else {
        callback(url, xhr);
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

  function addClass(node, className) {
    node.className += ' ' + className;

    return node.className;
  }

  function removeClass(node, className) {
    var spaceBefore = ' ' + className;
    var spaceAfter = className + ' ';

    if (node.className.indexOf(spaceBefore) !== -1) {
      node.className = node.className.replace(spaceBefore, '');
    } else if (node.className.indexOf(spaceAfter) !== -1) {
      node.className = node.className.replace(spaceAfter, '');
    } else {
      node.className = node.className.replace(className, '');
    }

    return node.className;
  }

  function data(node, attr) {
    return node.getAttribute('data-' + attr);
  }

  /* re-insert script tags
   */
  function insertScript($script) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    var s = document.createElement('script');
    s.type = 'text/javascript';
    if ($script.src) {
      s.onload = function () {
        // use the timeout trick to make sure the script is garbage collected,
        // when the iframe is destroyed.
        // sometimes when loading large files (eg. babel.js)
        // and a change is triggered,
        // the seq runner skips loading jotted.js, and runs the inline script
        // causing a `Jotted is undefined` error.
        setTimeout(callback);
      };
      s.onerror = callback;
      s.src = $script.src;
    } else {
      s.textContent = $script.innerText;
    }

    // re-insert the script tag so it executes.
    this.$resultFrame.contentWindow.document.head.appendChild(s);

    // clean-up
    $script.parentNode.removeChild($script);

    // run the callback immediately for inline scripts
    if (!$script.src) {
      callback();
    }
  }

  function runScripts() {
    var _this = this;

    // get scripts tags from content added with innerhtml
    var $scripts = this.$resultFrame.contentWindow.document.body.querySelectorAll('script');
    var l = $scripts.length;
    var runList = [];

    var _loop = function _loop(i) {
      runList.push(function (params, callback) {
        insertScript.call(_this, $scripts[i], callback);
      });
    };

    for (var i = 0; i < l; i++) {
      _loop(i);
    }

    // insert the script tags sequentially
    // so we preserve execution order
    seq(runList);
  }

  var plugins = [];

  function find(id) {
    for (var pluginIndex in plugins) {
      var plugin = plugins[pluginIndex];
      if (plugin._id === id) {
        return plugin;
      }
    }

    // can't find plugin
    throw new Error('Plugin ' + id + ' is not registered.');
  }

  function register(id, plugin) {
    // private properties
    plugin._id = id;
    plugins.push(plugin);
  }

  // create a new instance of each plugin, on the jotted instance
  function init() {
    var _this = this;

    this.options.plugins.forEach(function (plugin) {
      // check if plugin definition is string or object
      var Plugin = undefined;
      var pluginName = undefined;
      var pluginOptions = {};
      if (typeof plugin === 'string') {
        pluginName = plugin;
      } else if ((typeof plugin === 'undefined' ? 'undefined' : babelHelpers.typeof(plugin)) === 'object') {
        pluginName = plugin.name;
        pluginOptions = plugin.options || {};
      }

      Plugin = find(pluginName);
      _this.plugins[plugin] = new Plugin(_this, pluginOptions);

      addClass(_this.$container, pluginClass(pluginName));
    });
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
          var _this = this,
              _arguments = arguments;

          pub.callbacks[topic] = pub.callbacks[topic] || [];

          pub.callbacks[topic].forEach(function (c) {
            c.apply(_this, _arguments);
          });
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

  var PluginMarkdown = (function () {
    function PluginMarkdown(jotted, options) {
      babelHelpers.classCallCheck(this, PluginMarkdown);

      var priority = 20;

      this.options = extend(options, {});

      // check if marked is loaded
      if (typeof window.marked === 'undefined') {
        return;
      }

      window.marked.setOptions(options);

      // change html link label
      jotted.$container.querySelector('a[data-jotted-type="html"]').innerHTML = 'Markdown';

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginMarkdown, [{
      key: 'change',
      value: function change(params, callback) {
        // only parse html content
        if (params.type === 'html') {
          try {
            params.content = window.marked(params.content);
          } catch (err) {
            return callback(err, params);
          }

          callback(null, params);
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginMarkdown;
  })();

  var PluginBabel = (function () {
    function PluginBabel(jotted, options) {
      babelHelpers.classCallCheck(this, PluginBabel);

      var priority = 20;

      this.options = extend(options, {
        presets: ['es2015']
      });

      // check if babel is loaded
      if (typeof window.Babel === 'undefined') {
        return;
      }

      // change js link label
      jotted.$container.querySelector('a[data-jotted-type="js"]').innerHTML = 'ES2015';

      jotted.on('change', this.change.bind(this), priority);
    }

    babelHelpers.createClass(PluginBabel, [{
      key: 'change',
      value: function change(params, callback) {
        // only parse js content
        if (params.type === 'js') {
          try {
            params.content = window.Babel.transform(params.content, this.options).code;
          } catch (err) {
            return callback(err, params);
          }

          callback(null, params);
        } else {
          // make sure we callback either way,
          // to not break the pubsoup
          callback(null, params);
        }
      }
    }]);
    return PluginBabel;
  })();

  var PluginStylus = (function () {
    function PluginStylus(jotted, options) {
      babelHelpers.classCallCheck(this, PluginStylus);

      var priority = 20;

      options = extend(options, {});

      // check if stylus is loaded
      if (typeof window.stylus === 'undefined') {
        return;
      }

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

      options = extend(options, {});

      // check if coffeescript is loaded
      if (typeof window.CoffeeScript === 'undefined') {
        return;
      }

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

      options = extend(options, {});

      // check if less is loaded
      if (typeof window.less === 'undefined') {
        return;
      }

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

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      var _loop = function _loop() {
        var $textarea = $editors[i].querySelector('textarea');
        var type = data($textarea, 'jotted-type');
        var file = data($textarea, 'jotted-file');

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

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      var _loop = function _loop() {
        var $textarea = $editors[i].querySelector('textarea');
        var type = data($textarea, 'jotted-type');
        var file = data($textarea, 'jotted-file');

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
    jotted.plugin('coffeescript', PluginCoffeeScript);
    jotted.plugin('stylus', PluginStylus);
    jotted.plugin('babel', PluginBabel);
    jotted.plugin('markdown', PluginMarkdown);
  }

  var Jotted = (function () {
    function Jotted($editor, opts) {
      babelHelpers.classCallCheck(this, Jotted);

      if (!$editor) {
        throw new Error('Can\'t find Jotted container.');
      }

      this.options = extend(opts, {
        files: [],
        showBlank: false,
        runScripts: true,
        pane: 'result',
        debounce: 250,
        plugins: []
      });

      this.pubsoup = new PubSoup();
      // debounced trigger method
      this.trigger = debounce(this.pubsoup.publish.bind(this.pubsoup), this.options.debounce);

      // done change on all subscribers,
      // render the results.
      this.done('change', this.changeCallback.bind(this));

      this.plugins = {};

      this.$container = $editor;
      this.$container.innerHTML = container();
      addClass(this.$container, containerClass());

      // default pane
      this.paneActive = this.options.pane;
      addClass(this.$container, paneActiveClass(this.paneActive));

      this.$result = $editor.querySelector('.jotted-pane-result');
      this.createResultFrame();

      this.$pane = {};
      this.$status = {};

      var _arr = ['html', 'css', 'js'];
      for (var _i = 0; _i < _arr.length; _i++) {
        var type = _arr[_i];
        this.$pane[type] = $editor.querySelector('.jotted-pane-' + type);
        this.markup(type, this.$pane[type]);
      }

      // change events
      this.$container.addEventListener('change', debounce(this.change.bind(this), this.options.debounce));
      this.$container.addEventListener('keyup', debounce(this.change.bind(this), this.options.debounce));

      // pane change
      this.$container.addEventListener('click', this.pane.bind(this));

      // init plugins
      init.call(this);

      // show all tabs, even if empty
      if (this.options.showBlank) {
        addClass(this.$container, showBlankClass());
      }
    }

    babelHelpers.createClass(Jotted, [{
      key: 'findFile',
      value: function findFile(type) {
        var file = {};

        for (var fileIndex in this.options.files) {
          var _file = this.options.files[fileIndex];
          if (_file.type === type) {
            return _file;
          }
        }

        return file;
      }
    }, {
      key: 'markup',
      value: function markup(type, $parent) {
        var _this = this;

        // create the markup for an editor
        var file = this.findFile(type);

        var $editor = document.createElement('div');
        $editor.innerHTML = editorContent(type, file.url);
        $editor.className = editorClass(type);
        var $textarea = $editor.querySelector('textarea');

        $parent.appendChild($editor);

        // get the status node
        this.$status[type] = this.$pane[type].querySelector('.jotted-status');

        // if we don't have a file for the current type
        if (typeof file.url === 'undefined' && typeof file.content === 'undefined') {
          return;
        }

        // add the has-type class to the container
        addClass(this.$container, hasFileClass(type));

        // file as string
        if (typeof file.content !== 'undefined') {
          this.setValue($textarea, file.content);
        } else if (typeof file.url !== 'undefined') {
          // show loading message
          this.status('loading', [statusLoading(file.url)], {
            type: type,
            file: file
          });

          // file as url
          fetch(file.url, function (err, res) {
            if (err) {
              // show load errors
              _this.status('error', [statusFetchError(err)], {
                type: type
              });

              return;
            }

            // clear the loading status
            _this.clearStatus('loading', {
              type: type
            });

            _this.setValue($textarea, res);
          });
        }
      }
    }, {
      key: 'setValue',
      value: function setValue($textarea, val) {
        $textarea.value = val;

        // trigger change event, for initial render
        this.change({
          target: $textarea
        });
      }
    }, {
      key: 'change',
      value: function change(e) {
        if (!data(e.target, 'jotted-type')) {
          return;
        }

        // don't use .trigger,
        // so we don't debounce different change calls (html, css, js)
        // causing only one of them to be inserted.
        // the textarea change event is debounced when attached.
        this.pubsoup.publish('change', {
          type: data(e.target, 'jotted-type'),
          file: data(e.target, 'jotted-file'),
          content: e.target.value
        });
      }
    }, {
      key: 'createResultFrame',
      value: function createResultFrame() {
        var css = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        // maintain previous styles
        var $newStyle = document.createElement('style');

        if (this.$styleInject) {
          $newStyle.textContent = this.$styleInject.textContent;
        }

        this.$styleInject = $newStyle;

        if (this.$resultFrame) {
          this.$result.removeChild(this.$resultFrame);
        }

        this.$resultFrame = document.createElement('iframe');
        this.$result.appendChild(this.$resultFrame);

        var $frameDoc = this.$resultFrame.contentWindow.document;
        $frameDoc.open();
        $frameDoc.write(frameContent());
        $frameDoc.close();

        $frameDoc.head.appendChild(this.$styleInject);
      }
    }, {
      key: 'changeCallback',
      value: function changeCallback(errors, params) {
        this.status('error', errors, params);

        if (params.type === 'html') {
          // if we have script execution enabled,
          // re-create the iframe,
          // to stop execution of any previously started js,
          // and garbage collect it.
          if (this.options.runScripts) {
            this.createResultFrame();
          }

          this.$resultFrame.contentWindow.document.body.innerHTML = params.content;

          if (this.options.runScripts) {
            runScripts.call(this);
          }

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
            // only show eval errors if we don't have other errors from plugins.
            // useful for preprocessor error reporting (eg. babel, coffeescript).
            if (!errors.length) {
              this.status('error', [err.message], {
                type: 'js'
              });
            }
          }

          return;
        }
      }
    }, {
      key: 'pane',
      value: function pane(e) {
        if (!data(e.target, 'jotted-type')) {
          return;
        }

        removeClass(this.$container, paneActiveClass(this.paneActive));
        this.paneActive = data(e.target, 'jotted-type');
        addClass(this.$container, paneActiveClass(this.paneActive));

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
      key: 'status',
      value: function status() {
        var statusType = arguments.length <= 0 || arguments[0] === undefined ? 'error' : arguments[0];
        var messages = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
        var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        if (!messages.length) {
          return this.clearStatus(statusType, params);
        }

        // add error/loading class to status
        addClass(this.$status[params.type], statusClass(statusType));

        addClass(this.$container, statusActiveClass(params.type));

        var markup = '';
        messages.forEach(function (err) {
          markup += statusMessage(err);
        });

        this.$status[params.type].innerHTML = markup;
      }
    }, {
      key: 'clearStatus',
      value: function clearStatus(statusType, params) {
        removeClass(this.$status[params.type], statusClass(statusType));
        removeClass(this.$container, statusActiveClass(params.type));
        this.$status[params.type].innerHTML = '';
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