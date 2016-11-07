(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Jotted = factory());
}(this, (function () { 'use strict';

  /* util
   */

  function extend() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var extended = {};
    // clone object
    Object.keys(obj).forEach(function (key) {
      extended[key] = obj[key];
    });

    // copy default keys where undefined
    Object.keys(defaults).forEach(function (key) {
      if (typeof extended[key] !== 'undefined') {
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
      if (index < arr.length) {
        seqRunner(index, res, arr, errors, callback);
      } else {
        callback(errors, res);
      }
    };
  }

  function seqRunner(index, params, arr, errors, callback) {
    // async
    arr[index](params, runCallback.apply(this, arguments));
  }

  function seq(arr, params) {
    var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

    var errors = [];

    if (!arr.length) {
      return callback(errors, params);
    }

    seqRunner(0, params, arr, errors, callback);
  }

  function debounce(fn, delay) {
    var cooldown = null;
    var multiple = null;
    return function () {
      var _this = this,
          _arguments = arguments;

      if (cooldown) {
        multiple = true;
      } else {
        fn.apply(this, arguments);
      }

      clearTimeout(cooldown);

      cooldown = setTimeout(function () {
        if (multiple) {
          fn.apply(_this, _arguments);
        }

        cooldown = null;
        multiple = null;
      }, delay);
    };
  }

  function hasClass(node, className) {
    if (!node.className) {
      return false;
    }
    var tempClass = ' ' + node.className + ' ';
    className = ' ' + className + ' ';

    if (tempClass.indexOf(className) !== -1) {
      return true;
    }

    return false;
  }

  function addClass(node, className) {
    // class is already added
    if (hasClass(node, className)) {
      return node.className;
    }

    if (node.className) {
      className = ' ' + className;
    }

    node.className += className;

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

  // mode detection based on content type and file extension
  var defaultModemap = {
    'html': 'html',
    'css': 'css',
    'js': 'javascript',
    'less': 'less',
    'styl': 'stylus',
    'coffee': 'coffeescript'
  };

  function getMode() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var file = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var customModemap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var modemap = extend(customModemap, defaultModemap);

    // try the file extension
    for (var key in modemap) {
      var keyLength = key.length;
      if (file.slice(-keyLength++) === '.' + key) {
        return modemap[key];
      }
    }

    // try the file type (html/css/js)
    for (var _key in modemap) {
      if (type === _key) {
        return modemap[_key];
      }
    }

    return type;
  }

  /* template
   */

  function container() {
    return '\n    <ul class="jotted-nav">\n      <li class="jotted-nav-item jotted-nav-item-result">\n        <a href="#" data-jotted-type="result">\n          Result\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-html">\n        <a href="#" data-jotted-type="html">\n          HTML\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-css">\n        <a href="#" data-jotted-type="css">\n          CSS\n        </a>\n      </li>\n      <li class="jotted-nav-item jotted-nav-item-js">\n        <a href="#" data-jotted-type="js">\n          JavaScript\n        </a>\n      </li>\n    </ul>\n    <div class="jotted-pane jotted-pane-result"><iframe></iframe></div>\n    <div class="jotted-pane jotted-pane-html"></div>\n    <div class="jotted-pane jotted-pane-css"></div>\n    <div class="jotted-pane jotted-pane-js"></div>\n  ';
  }

  function paneActiveClass(type) {
    return 'jotted-pane-active-' + type;
  }

  function containerClass() {
    return 'jotted';
  }

  function hasFileClass(type) {
    return 'jotted-has-' + type;
  }

  function editorClass(type) {
    return 'jotted-editor jotted-editor-' + type;
  }

  function editorContent(type) {
    var fileUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

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

  function statusLoading(url) {
    return 'Loading <strong>' + url + '</strong>..';
  }

  function statusFetchError(url) {
    return 'There was an error loading <strong>' + url + '</strong>.';
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };





  var asyncGenerator = function () {
    function AwaitValue(value) {
      this.value = value;
    }

    function AsyncGenerator(gen) {
      var front, back;

      function send(key, arg) {
        return new Promise(function (resolve, reject) {
          var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null
          };

          if (back) {
            back = back.next = request;
          } else {
            front = back = request;
            resume(key, arg);
          }
        });
      }

      function resume(key, arg) {
        try {
          var result = gen[key](arg);
          var value = result.value;

          if (value instanceof AwaitValue) {
            Promise.resolve(value.value).then(function (arg) {
              resume("next", arg);
            }, function (arg) {
              resume("throw", arg);
            });
          } else {
            settle(result.done ? "return" : "normal", result.value);
          }
        } catch (err) {
          settle("throw", err);
        }
      }

      function settle(type, value) {
        switch (type) {
          case "return":
            front.resolve({
              value: value,
              done: true
            });
            break;

          case "throw":
            front.reject(value);
            break;

          default:
            front.resolve({
              value: value,
              done: false
            });
            break;
        }

        front = front.next;

        if (front) {
          resume(front.key, front.arg);
        } else {
          back = null;
        }
      }

      this._invoke = send;

      if (typeof gen.return !== "function") {
        this.return = undefined;
      }
    }

    if (typeof Symbol === "function" && Symbol.asyncIterator) {
      AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
        return this;
      };
    }

    AsyncGenerator.prototype.next = function (arg) {
      return this._invoke("next", arg);
    };

    AsyncGenerator.prototype.throw = function (arg) {
      return this._invoke("throw", arg);
    };

    AsyncGenerator.prototype.return = function (arg) {
      return this._invoke("return", arg);
    };

    return {
      wrap: function (fn) {
        return function () {
          return new AsyncGenerator(fn.apply(this, arguments));
        };
      },
      await: function (value) {
        return new AwaitValue(value);
      }
    };
  }();





  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
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
  }();







  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

















  var set = function set(object, property, value, receiver) {
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent !== null) {
        set(parent, property, value, receiver);
      }
    } else if ("value" in desc && desc.writable) {
      desc.value = value;
    } else {
      var setter = desc.set;

      if (setter !== undefined) {
        setter.call(receiver, value);
      }
    }

    return value;
  };

  /* plugin
   */

  var plugins = [];

  function find$1(id) {
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

    this._get('options').plugins.forEach(function (plugin) {
      // check if plugin definition is string or object
      var Plugin = void 0;
      var pluginName = void 0;
      var pluginOptions = {};
      if (typeof plugin === 'string') {
        pluginName = plugin;
      } else if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object') {
        pluginName = plugin.name;
        pluginOptions = plugin.options || {};
      }

      Plugin = find$1(pluginName);
      _this._get('plugins')[plugin] = new Plugin(_this, pluginOptions);

      addClass(_this._get('$container'), pluginClass(pluginName));
    });
  }

  /* pubsoup
   */

  var PubSoup = function () {
    function PubSoup() {
      classCallCheck(this, PubSoup);

      this.topics = {};
      this.callbacks = {};
    }

    createClass(PubSoup, [{
      key: 'find',
      value: function find(query) {
        this.topics[query] = this.topics[query] || [];
        return this.topics[query];
      }
    }, {
      key: 'subscribe',
      value: function subscribe(topic, subscriber) {
        var priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 90;

        var foundTopic = this.find(topic);
        subscriber._priority = priority;
        foundTopic.push(subscriber);

        // sort subscribers on priority
        foundTopic.sort(function (a, b) {
          return a._priority > b._priority ? 1 : b._priority > a._priority ? -1 : 0;
        });
      }

      // removes a function from an array

    }, {
      key: 'remover',
      value: function remover(arr, fn) {
        arr.forEach(function () {
          // if no fn is specified
          // clean-up the array
          if (!fn) {
            arr.length = 0;
            return;
          }

          // find the fn in the arr
          var index = [].indexOf.call(arr, fn);

          // we didn't find it in the array
          if (index === -1) {
            return;
          }

          arr.splice(index, 1);
        });
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(topic, subscriber) {
        // remove from subscribers
        var foundTopic = this.find(topic);
        this.remover(foundTopic, subscriber);

        // remove from callbacks
        this.callbacks[topic] = this.callbacks[topic] || [];
        this.remover(this.callbacks[topic], subscriber);
      }

      // sequentially runs a method on all plugins

    }, {
      key: 'publish',
      value: function publish(topic) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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
        var _this = this;

        return function (err, params) {
          _this.callbacks[topic] = _this.callbacks[topic] || [];

          _this.callbacks[topic].forEach(function (c) {
            c(err, params);
          });
        };
      }

      // attach a callback when a publish[topic] is done

    }, {
      key: 'done',
      value: function done(topic) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

        this.callbacks[topic] = this.callbacks[topic] || [];
        this.callbacks[topic].push(callback);
      }
    }]);
    return PubSoup;
  }();

  /* render plugin
   * renders the iframe
   */

  var PluginRender = function () {
    function PluginRender(jotted, options) {
      classCallCheck(this, PluginRender);

      options = extend(options, {});

      // iframe srcdoc support
      var supportSrcdoc = !!('srcdoc' in document.createElement('iframe'));
      var $resultFrame = jotted.$container.querySelector('.jotted-pane-result iframe');

      var frameContent = '';

      // cached content
      var content = {
        html: '',
        css: '',
        js: ''
      };

      // catch domready events from the iframe
      window.addEventListener('message', this.domready.bind(this));

      // render on each change
      jotted.on('change', this.change.bind(this), 100);

      // public
      this.supportSrcdoc = supportSrcdoc;
      this.content = content;
      this.frameContent = frameContent;
      this.$resultFrame = $resultFrame;

      this.callbacks = [];
      this.index = 0;

      this.lastCallback = function () {};
    }

    createClass(PluginRender, [{
      key: 'template',
      value: function template() {
        var style = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var script = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        return '\n      <!doctype html>\n      <html>\n        <head>\n          <script>\n            (function () {\n              window.addEventListener(\'DOMContentLoaded\', function () {\n                window.parent.postMessage(JSON.stringify({\n                  type: \'jotted-dom-ready\'\n                }), \'*\')\n              })\n            }())\n          </script>\n\n          <style>' + style + '</style>\n        </head>\n        <body>\n          ' + body + '\n\n          <!--\n            Jotted:\n            Empty script tag prevents malformed HTML from breaking the next script.\n          -->\n          <script></script>\n          <script>' + script + '</script>\n        </body>\n      </html>\n    ';
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        var _this = this;

        // cache manipulated content
        this.content[params.type] = params.content;

        // check existing and to-be-rendered content
        var oldFrameContent = this.frameContent;
        this.frameContent = this.template(this.content['css'], this.content['html'], this.content['js']);

        // cache the current callback as global,
        // so we can call it from the message callback.
        this.lastCallback = function () {
          _this.lastCallback = function () {};

          callback(null, params);
        };

        // don't render if previous and new frame content are the same.
        // mostly for the `play` plugin,
        // so we don't re-render the same content on each change.
        // unless we set forceRender.
        if (params.forceRender !== true && this.frameContent === oldFrameContent) {
          callback(null, params);
          return;
        }

        if (this.supportSrcdoc) {
          // srcdoc in unreliable in Chrome.
          // https://github.com/ghinda/jotted/issues/23

          // re-create the iframe on each change,
          // to discard the previously loaded scripts.
          var $newResultFrame = document.createElement('iframe');
          this.$resultFrame.parentNode.replaceChild($newResultFrame, this.$resultFrame);
          this.$resultFrame = $newResultFrame;

          this.$resultFrame.contentWindow.document.open();
          this.$resultFrame.contentWindow.document.write(this.frameContent);
          this.$resultFrame.contentWindow.document.close();
        } else {
          // older browsers without iframe srcset support (IE9).
          this.$resultFrame.setAttribute('data-srcdoc', this.frameContent);

          // tips from https://github.com/jugglinmike/srcdoc-polyfill
          // Copyright (c) 2012 Mike Pennisi
          // Licensed under the MIT license.
          var jsUrl = 'javascript:window.frameElement.getAttribute("data-srcdoc");';

          this.$resultFrame.setAttribute('src', jsUrl);

          // Explicitly set the iFrame's window.location for
          // compatibility with IE9, which does not react to changes in
          // the `src` attribute when it is a `javascript:` URL.
          if (this.$resultFrame.contentWindow) {
            this.$resultFrame.contentWindow.location = jsUrl;
          }
        }
      }
    }, {
      key: 'domready',
      value: function domready(e) {
        // only catch messages from the iframe
        if (e.source !== this.$resultFrame.contentWindow) {
          return;
        }

        var data$$1 = {};
        try {
          data$$1 = JSON.parse(e.data);
        } catch (e) {}

        if (data$$1.type === 'jotted-dom-ready') {
          this.lastCallback();
        }
      }
    }]);
    return PluginRender;
  }();

  /* scriptless plugin
   * removes script tags from html content
   */

  var PluginScriptless = function () {
    function PluginScriptless(jotted, options) {
      classCallCheck(this, PluginScriptless);

      options = extend(options, {});

      // https://html.spec.whatwg.org/multipage/scripting.html
      var runScriptTypes = ['application/javascript', 'application/ecmascript', 'application/x-ecmascript', 'application/x-javascript', 'text/ecmascript', 'text/javascript', 'text/javascript1.0', 'text/javascript1.1', 'text/javascript1.2', 'text/javascript1.3', 'text/javascript1.4', 'text/javascript1.5', 'text/jscript', 'text/livescript', 'text/x-ecmascript', 'text/x-javascript'];

      // remove script tags on each change
      jotted.on('change', this.change.bind(this));

      // public
      this.runScriptTypes = runScriptTypes;
    }

    createClass(PluginScriptless, [{
      key: 'change',
      value: function change(params, callback) {
        if (params.type !== 'html') {
          return callback(null, params);
        }

        // for IE9 support, remove the script tags from HTML content.
        // when we stop supporting IE9, we can use the sandbox attribute.
        var fragment = document.createElement('div');
        fragment.innerHTML = params.content;

        var typeAttr = null;

        // remove all script tags
        var $scripts = fragment.querySelectorAll('script');
        for (var i = 0; i < $scripts.length; i++) {
          typeAttr = $scripts[i].getAttribute('type');

          // only remove script tags without the type attribute
          // or with a javascript mime attribute value.
          // the ones that are run by the browser.
          if (!typeAttr || this.runScriptTypes.indexOf(typeAttr) !== -1) {
            $scripts[i].parentNode.removeChild($scripts[i]);
          }
        }

        params.content = fragment.innerHTML;

        callback(null, params);
      }
    }]);
    return PluginScriptless;
  }();

  /* ace plugin
   */

  var PluginAce = function () {
    function PluginAce(jotted, options) {
      classCallCheck(this, PluginAce);

      var priority = 1;
      var i;

      this.editor = {};
      this.jotted = jotted;

      options = extend(options, {});

      // check if Ace is loaded
      if (typeof window.ace === 'undefined') {
        return;
      }

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      for (i = 0; i < $editors.length; i++) {
        var $textarea = $editors[i].querySelector('textarea');
        var type = data($textarea, 'jotted-type');
        var file = data($textarea, 'jotted-file');

        var $aceContainer = document.createElement('div');
        $editors[i].appendChild($aceContainer);

        this.editor[type] = window.ace.edit($aceContainer);
        var editor = this.editor[type];

        var editorOptions = extend(options);

        editor.getSession().setMode('ace/mode/' + getMode(type, file));
        editor.getSession().setOptions(editorOptions);

        editor.$blockScrolling = Infinity;
      }

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginAce, [{
      key: 'editorChange',
      value: function editorChange(params) {
        var _this = this;

        return function () {
          _this.jotted.trigger('change', params);
        };
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        var editor = this.editor[params.type];

        // if the event is not started by the ace change.
        // triggered only once per editor,
        // when the textarea is populated/file is loaded.
        if (!params.aceEditor) {
          editor.getSession().setValue(params.content);

          // attach the event only after the file is loaded
          params.aceEditor = editor;
          editor.on('change', this.editorChange(params));
        }

        // manipulate the params and pass them on
        params.content = editor.getValue();
        callback(null, params);
      }
    }]);
    return PluginAce;
  }();

  /* coremirror plugin
   */

  var PluginCodeMirror = function () {
    function PluginCodeMirror(jotted, options) {
      classCallCheck(this, PluginCodeMirror);

      var priority = 1;
      var i;

      this.editor = {};
      this.jotted = jotted;

      // custom modemap for codemirror
      var modemap = {
        'html': 'htmlmixed'
      };

      options = extend(options, {
        lineNumbers: true
      });

      // check if CodeMirror is loaded
      if (typeof window.CodeMirror === 'undefined') {
        return;
      }

      var $editors = jotted.$container.querySelectorAll('.jotted-editor');

      for (i = 0; i < $editors.length; i++) {
        var $textarea = $editors[i].querySelector('textarea');
        var type = data($textarea, 'jotted-type');
        var file = data($textarea, 'jotted-file');

        this.editor[type] = window.CodeMirror.fromTextArea($textarea, options);
        this.editor[type].setOption('mode', getMode(type, file, modemap));
      }

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginCodeMirror, [{
      key: 'editorChange',
      value: function editorChange(params) {
        var _this = this;

        return function () {
          // trigger a change event
          _this.jotted.trigger('change', params);
        };
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        var editor = this.editor[params.type];

        // if the event is not started by the codemirror change.
        // triggered only once per editor,
        // when the textarea is populated/file is loaded.
        if (!params.cmEditor) {
          editor.setValue(params.content);

          // attach the event only after the file is loaded
          params.cmEditor = editor;
          editor.on('change', this.editorChange(params));
        }

        // manipulate the params and pass them on
        params.content = editor.getValue();
        callback(null, params);
      }
    }]);
    return PluginCodeMirror;
  }();

  /* less plugin
   */

  var PluginLess = function () {
    function PluginLess(jotted, options) {
      classCallCheck(this, PluginLess);

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

    createClass(PluginLess, [{
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
  }();

  /* coffeescript plugin
   */

  var PluginCoffeeScript = function () {
    function PluginCoffeeScript(jotted, options) {
      classCallCheck(this, PluginCoffeeScript);

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

    createClass(PluginCoffeeScript, [{
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
  }();

  /* stylus plugin
   */

  var PluginStylus = function () {
    function PluginStylus(jotted, options) {
      classCallCheck(this, PluginStylus);

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

    createClass(PluginStylus, [{
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
  }();

  /* babel plugin
   */

  var PluginBabel = function () {
    function PluginBabel(jotted, options) {
      classCallCheck(this, PluginBabel);

      var priority = 20;

      this.options = extend(options, {});

      // check if babel is loaded
      if (typeof window.Babel !== 'undefined') {
        // using babel-standalone
        this.babel = window.Babel;
      } else if (typeof window.babel !== 'undefined') {
        // using browser.js from babel-core 5.x
        this.babel = {
          transform: window.babel
        };
      } else {
        return;
      }

      // change js link label
      jotted.$container.querySelector('a[data-jotted-type="js"]').innerHTML = 'ES2015';

      jotted.on('change', this.change.bind(this), priority);
    }

    createClass(PluginBabel, [{
      key: 'change',
      value: function change(params, callback) {
        // only parse js content
        if (params.type === 'js') {
          try {
            params.content = this.babel.transform(params.content, this.options).code;
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
  }();

  /* markdown plugin
   */

  var PluginMarkdown = function () {
    function PluginMarkdown(jotted, options) {
      classCallCheck(this, PluginMarkdown);

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

    createClass(PluginMarkdown, [{
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
  }();

  /* console plugin
   */

  var PluginConsole = function () {
    function PluginConsole(jotted, options) {
      classCallCheck(this, PluginConsole);

      options = extend(options, {
        autoClear: false
      });

      var priority = 30;
      var history = [];
      var historyIndex = 0;
      var logCaptureSnippet = '(' + this.capture.toString() + ')();';
      var contentCache = {
        html: '',
        css: '',
        js: ''
      };

      // new tab and pane markup
      var $nav = document.createElement('li');
      addClass($nav, 'jotted-nav-item jotted-nav-item-console');
      $nav.innerHTML = '<a href="#" data-jotted-type="console">JS Console</a>';

      var $pane = document.createElement('div');
      addClass($pane, 'jotted-pane jotted-pane-console');

      $pane.innerHTML = '\n      <div class="jotted-console-container">\n        <ul class="jotted-console-output"></ul>\n        <form class="jotted-console-input">\n          <input type="text">\n        </form>\n      </div>\n      <button class="jotted-button jotted-console-clear">Clear</button>\n    ';

      jotted.$container.appendChild($pane);
      jotted.$container.querySelector('.jotted-nav').appendChild($nav);

      var $container = jotted.$container.querySelector('.jotted-console-container');
      var $output = jotted.$container.querySelector('.jotted-console-output');
      var $input = jotted.$container.querySelector('.jotted-console-input input');
      var $inputForm = jotted.$container.querySelector('.jotted-console-input');
      var $clear = jotted.$container.querySelector('.jotted-console-clear');

      // submit the input form
      $inputForm.addEventListener('submit', this.submit.bind(this));

      // console history
      $input.addEventListener('keydown', this.history.bind(this));

      // clear button
      $clear.addEventListener('click', this.clear.bind(this));

      // clear the console on each change
      if (options.autoClear === true) {
        jotted.on('change', this.autoClear.bind(this), priority - 1);
      }

      // capture the console on each change
      jotted.on('change', this.change.bind(this), priority);

      // get log events from the iframe
      window.addEventListener('message', this.getMessage.bind(this));

      // plugin public properties
      this.$jottedContainer = jotted.$container;
      this.$container = $container;
      this.$input = $input;
      this.$output = $output;
      this.history = history;
      this.historyIndex = historyIndex;
      this.logCaptureSnippet = logCaptureSnippet;
      this.contentCache = contentCache;
      this.getIframe = this.getIframe.bind(this);
    }

    createClass(PluginConsole, [{
      key: 'getIframe',
      value: function getIframe() {
        return this.$jottedContainer.querySelector('.jotted-pane-result iframe');
      }
    }, {
      key: 'getMessage',
      value: function getMessage(e) {
        // only catch messages from the iframe
        if (e.source !== this.getIframe().contentWindow) {
          return;
        }

        var data$$1 = {};
        try {
          data$$1 = JSON.parse(e.data);
        } catch (err) {}

        if (data$$1.type === 'jotted-console-log') {
          this.log(data$$1.message);
        }
      }
    }, {
      key: 'autoClear',
      value: function autoClear(params, callback) {
        var snippetlessContent = params.content;

        // remove the snippet from cached js content
        if (params.type === 'js') {
          snippetlessContent = snippetlessContent.replace(this.logCaptureSnippet, '');
        }

        // for compatibility with the Play plugin,
        // clear the console only if something has changed or force rendering.
        if (params.forceRender === true || this.contentCache[params.type] !== snippetlessContent) {
          this.clear();
        }

        // always cache the latest content
        this.contentCache[params.type] = snippetlessContent;

        callback(null, params);
      }
    }, {
      key: 'change',
      value: function change(params, callback) {
        // only parse js content
        if (params.type !== 'js') {
          // make sure we callback either way,
          // to not break the pubsoup
          return callback(null, params);
        }

        // check if the snippet is already added.
        // the Play plugin caches the changed params and triggers change
        // with the cached response, causing the snippet to be inserted
        // multiple times, on each trigger.
        if (params.content.indexOf(this.logCaptureSnippet) === -1) {
          params.content = '' + this.logCaptureSnippet + params.content;
        }

        callback(null, params);
      }

      // capture the console.log output

    }, {
      key: 'capture',
      value: function capture() {
        // IE9 with devtools closed
        if (typeof window.console === 'undefined' || typeof window.console.log === 'undefined') {
          window.console = {
            log: function log() {}
          };
        }

        // for IE9 support
        var oldConsoleLog = Function.prototype.bind.call(window.console.log, window.console);

        window.console.log = function () {
          // send log messages to the parent window
          [].slice.call(arguments).forEach(function (message) {
            window.parent.postMessage(JSON.stringify({
              type: 'jotted-console-log',
              message: message
            }), '*');
          });

          // in IE9, console.log is object instead of function
          // https://connect.microsoft.com/IE/feedback/details/585896/console-log-typeof-is-object-instead-of-function
          oldConsoleLog.apply(oldConsoleLog, arguments);
        };
      }
    }, {
      key: 'log',
      value: function log() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var type = arguments[1];

        var $log = document.createElement('li');
        addClass($log, 'jotted-console-log');

        if (typeof type !== 'undefined') {
          addClass($log, 'jotted-console-log-' + type);
        }

        $log.innerHTML = message;

        this.$output.appendChild($log);
      }
    }, {
      key: 'submit',
      value: function submit(e) {
        var inputValue = this.$input.value.trim();

        // if input is blank, do nothing
        if (inputValue === '') {
          return e.preventDefault();
        }

        // add run to history
        this.history.push(inputValue);
        this.historyIndex = this.history.length;

        // log input value
        this.log(inputValue, 'history');

        // add return if it doesn't start with it
        if (inputValue.indexOf('return') !== 0) {
          inputValue = 'return ' + inputValue;
        }

        // show output or errors
        try {
          // run the console input in the iframe context
          var scriptOutput = this.getIframe().contentWindow.eval('(function() {' + inputValue + '})()');

          this.log(scriptOutput);
        } catch (err) {
          this.log(err, 'error');
        }

        // clear the console value
        this.$input.value = '';

        // scroll console pane to bottom
        // to keep the input into view
        this.$container.scrollTop = this.$container.scrollHeight;

        e.preventDefault();
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.$output.innerHTML = '';
      }
    }, {
      key: 'history',
      value: function history(e) {
        var UP = 38;
        var DOWN = 40;
        var gotHistory = false;
        var selectionStart = this.$input.selectionStart;

        // only if we have previous history
        // and the cursor is at the start
        if (e.keyCode === UP && this.historyIndex !== 0 && selectionStart === 0) {
          this.historyIndex--;
          gotHistory = true;
        }

        // only if we have future history
        // and the cursor is at the end
        if (e.keyCode === DOWN && this.historyIndex !== this.history.length - 1 && selectionStart === this.$input.value.length) {
          this.historyIndex++;
          gotHistory = true;
        }

        // only if history changed
        if (gotHistory) {
          this.$input.value = this.history[this.historyIndex];
        }
      }
    }]);
    return PluginConsole;
  }();

  /* play plugin
   * adds a Run button
   */

  var PluginPlay = function () {
    function PluginPlay(jotted, options) {
      classCallCheck(this, PluginPlay);

      options = extend(options, {
        firstRun: true
      });

      var priority = 10;
      // cached code
      var cache = {};
      // latest version of the code.
      // replaces the cache when the run button is pressed.
      var code = {};

      // set firstRun=false to start with a blank preview.
      // run the real content only after the first Run button press.
      if (options.firstRun === false) {
        cache = {
          html: {
            type: 'html',
            content: ''
          },
          css: {
            type: 'css',
            content: ''
          },
          js: {
            type: 'js',
            content: ''
          }
        };
      }

      // run button
      var $button = document.createElement('button');
      $button.className = 'jotted-button jotted-button-play';
      $button.innerHTML = 'Run';

      jotted.$container.appendChild($button);
      $button.addEventListener('click', this.run.bind(this));

      // capture the code on each change
      jotted.on('change', this.change.bind(this), priority);

      // public
      this.cache = cache;
      this.code = code;
      this.jotted = jotted;
    }

    createClass(PluginPlay, [{
      key: 'change',
      value: function change(params, callback) {
        // always cache the latest code
        this.code[params.type] = extend(params);

        // replace the params with the latest cache
        if (typeof this.cache[params.type] !== 'undefined') {
          callback(null, this.cache[params.type]);

          // make sure we don't cache forceRender,
          // and send it with each change.
          this.cache[params.type].forceRender = null;
        } else {
          // cache the first run
          this.cache[params.type] = extend(params);

          callback(null, params);
        }
      }
    }, {
      key: 'run',
      value: function run() {
        // trigger change on each type with the latest code
        for (var type in this.code) {
          this.cache[type] = extend(this.code[type], {
            // force rendering on each Run press
            forceRender: true
          });

          // trigger the change
          this.jotted.trigger('change', this.cache[type]);
        }
      }
    }]);
    return PluginPlay;
  }();

  /* pen plugin
   */
  var PluginPen = function () {
    function PluginPen(jotted, options) {
      classCallCheck(this, PluginPen);

      // available panes
      var panes = {
        html: { title: 'HTML', classChecker: 'jotted-has-html' },
        css: { title: 'CSS', classChecker: 'jotted-has-css' },
        js: { title: 'JavaScript', classChecker: 'jotted-has-js' },
        console: { title: 'Console', classChecker: 'jotted-plugin-console' }
      };

      var $availablePanes = [];
      for (var p in panes) {
        if (jotted.$container.classList.contains(panes[p].classChecker)) {
          $availablePanes.push(jotted.$container.querySelector('.jotted-pane-' + p));
        }
      }

      this.resizablePanes = [];
      for (var i = 0; i < $availablePanes.length; i++) {
        var type = void 0;

        for (var j = 0; j < $availablePanes[i].classList.length; j++) {
          if ($availablePanes[i].classList[j].indexOf('jotted-pane-') !== -1) {
            type = $availablePanes[i].classList[j].replace('jotted-pane-', '');
            break;
          }
        }

        if (!type) {
          continue;
        }

        var $pane = {
          container: $availablePanes[i],
          expander: undefined
        };

        this.resizablePanes.push($pane);

        var $paneTitle = document.createElement('div');
        $paneTitle.classList.add('jotted-pane-title');
        $paneTitle.innerHTML = panes[type].title || type;

        var $paneElement = $availablePanes[i].firstElementChild;
        $paneElement.insertBefore($paneTitle, $paneElement.firstChild);

        // insert expander element.
        // only panes which have an expander can be shrunk or expanded
        // first pane must not have a expander
        if (i > 0) {
          $pane.expander = document.createElement('div');
          $pane.expander.classList.add('jotted-plugin-pen-expander');
          $pane.expander.addEventListener('mousedown', this.startExpand.bind(this, jotted));

          $paneElement.insertBefore($pane.expander, $paneTitle);
        }
      }
    }

    createClass(PluginPen, [{
      key: 'startExpand',
      value: function startExpand(jotted, event) {
        var $pane = this.resizablePanes.filter(function (pane) {
          return pane.expander === event.target;
        }).shift();

        var $previousPane = this.resizablePanes[this.resizablePanes.indexOf($pane) - 1];

        var $relativePixel = 100 / parseInt(window.getComputedStyle($pane.container.parentNode)['width'], 10);

        // ugly but reliable & cross-browser way of getting height/width as percentage.
        $pane.container.parentNode.style.display = 'none';

        $pane.startX = event.clientX;
        $pane.startWidth = parseFloat(window.getComputedStyle($pane.container)['width'], 10);
        $previousPane.startWidth = parseFloat(window.getComputedStyle($previousPane.container)['width'], 10);

        $pane.container.parentNode.style.display = '';

        $pane.mousemove = this.doDrag.bind(this, $pane, $previousPane, $relativePixel);
        $pane.mouseup = this.stopDrag.bind(this, $pane);

        document.addEventListener('mousemove', $pane.mousemove, false);
        document.addEventListener('mouseup', $pane.mouseup, false);
      }
    }, {
      key: 'doDrag',
      value: function doDrag(pane, previousPane, relativePixel, event) {
        // previous pane new width
        var ppNewWidth = previousPane.startWidth + (event.clientX - pane.startX) * relativePixel;

        // current pane new width
        var cpNewWidth = pane.startWidth - (event.clientX - pane.startX) * relativePixel;

        // contracting a pane is restricted to a min-size of 10% the container's space.
        var PANE_MIN_SIZE = 10; // percentage %
        if (ppNewWidth >= PANE_MIN_SIZE && cpNewWidth >= PANE_MIN_SIZE) {
          pane.container.style.maxWidth = 'none';
          previousPane.container.style.maxWidth = 'none';

          previousPane.container.style.width = ppNewWidth + '%';
          pane.container.style.width = cpNewWidth + '%';
        }
      }
    }, {
      key: 'stopDrag',
      value: function stopDrag(pane, event) {
        document.removeEventListener('mousemove', pane.mousemove, false);
        document.removeEventListener('mouseup', pane.mouseup, false);
      }
    }]);
    return PluginPen;
  }();

  /* bundle plugins
   */

  // register bundled plugins
  function BundlePlugins(jotted) {
    jotted.plugin('render', PluginRender);
    jotted.plugin('scriptless', PluginScriptless);

    jotted.plugin('ace', PluginAce);
    jotted.plugin('codemirror', PluginCodeMirror);
    jotted.plugin('less', PluginLess);
    jotted.plugin('coffeescript', PluginCoffeeScript);
    jotted.plugin('stylus', PluginStylus);
    jotted.plugin('babel', PluginBabel);
    jotted.plugin('markdown', PluginMarkdown);
    jotted.plugin('console', PluginConsole);
    jotted.plugin('play', PluginPlay);
    jotted.plugin('pen', PluginPen);
  }

  /* jotted
   */

  var Jotted = function () {
    function Jotted($jottedContainer, opts) {
      classCallCheck(this, Jotted);

      if (!$jottedContainer) {
        throw new Error('Can\'t find Jotted container.');
      }

      // private data
      var _private = {};
      this._get = function (key) {
        return _private[key];
      };
      this._set = function (key, value) {
        _private[key] = value;
        return _private[key];
      };

      // options
      var options = this._set('options', extend(opts, {
        files: [],
        showBlank: false,
        runScripts: true,
        pane: 'result',
        debounce: 250,
        plugins: []
      }));

      // the render plugin is mandatory
      options.plugins.push('render');

      // use the scriptless plugin if runScripts is false
      if (options.runScripts === false) {
        options.plugins.push('scriptless');
      }

      // cached content for the change method.
      this._set('cachedContent', {
        html: null,
        css: null,
        js: null
      });

      // PubSoup
      var pubsoup = this._set('pubsoup', new PubSoup());

      this._set('trigger', this.trigger());
      this._set('on', function () {
        pubsoup.subscribe.apply(pubsoup, arguments);
      });
      this._set('off', function () {
        pubsoup.unsubscribe.apply(pubsoup, arguments);
      });
      var done = this._set('done', function () {
        pubsoup.done.apply(pubsoup, arguments);
      });

      // after all plugins run
      // show errors
      done('change', this.errors.bind(this));

      // DOM
      var $container = this._set('$container', $jottedContainer);
      $container.innerHTML = container();
      addClass($container, containerClass());

      // default pane
      var paneActive = this._set('paneActive', options.pane);
      addClass($container, paneActiveClass(paneActive));

      // status nodes
      this._set('$status', {});

      var _arr = ['html', 'css', 'js'];
      for (var _i = 0; _i < _arr.length; _i++) {
        var _type = _arr[_i];
        this.markup(_type);
      }

      // textarea change events.
      $container.addEventListener('keyup', debounce(this.change.bind(this), options.debounce));
      $container.addEventListener('change', debounce(this.change.bind(this), options.debounce));

      // pane change
      $container.addEventListener('click', this.pane.bind(this));

      // expose public properties
      this.$container = this._get('$container');
      this.on = this._get('on');
      this.off = this._get('off');
      this.done = this._get('done');
      this.trigger = this._get('trigger');
      this.paneActive = this._get('paneActive');

      // init plugins
      this._set('plugins', {});
      init.call(this);

      // load files
      var _arr2 = ['html', 'css', 'js'];
      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        var _type2 = _arr2[_i2];
        this.load(_type2);
      }

      // show all tabs, even if empty
      if (options.showBlank) {
        var _arr3 = ['html', 'css', 'js'];

        for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
          var type = _arr3[_i3];
          addClass($container, hasFileClass(type));
        }
      }
    }

    createClass(Jotted, [{
      key: 'findFile',
      value: function findFile(type) {
        var file = {};
        var options = this._get('options');

        for (var fileIndex in options.files) {
          var _file = options.files[fileIndex];
          if (_file.type === type) {
            return _file;
          }
        }

        return file;
      }
    }, {
      key: 'markup',
      value: function markup(type) {
        var $container = this._get('$container');
        var $parent = $container.querySelector('.jotted-pane-' + type);
        // create the markup for an editor
        var file = this.findFile(type);

        var $editor = document.createElement('div');
        $editor.innerHTML = editorContent(type, file.url);
        $editor.className = editorClass(type);

        $parent.appendChild($editor);

        // get the status node
        this._get('$status')[type] = $parent.querySelector('.jotted-status');

        // if we have a file for the current type
        if (typeof file.url !== 'undefined' || typeof file.content !== 'undefined') {
          // add the has-type class to the container
          addClass($container, hasFileClass(type));
        }
      }
    }, {
      key: 'load',
      value: function load(type) {
        var _this = this;

        // create the markup for an editor
        var file = this.findFile(type);
        var $textarea = this._get('$container').querySelector('.jotted-pane-' + type + ' textarea');

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
        } else {
          // trigger a change event on blank editors,
          // for editor plugins to catch.
          // (eg. the codemirror and ace plugins attach the change event
          // only after the initial change/load event)
          this.setValue($textarea, '');
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
        var type = data(e.target, 'jotted-type');
        if (!type) {
          return;
        }

        // don't trigger change if the content hasn't changed.
        // eg. when blurring the textarea.
        var cachedContent = this._get('cachedContent');
        if (cachedContent[type] === e.target.value) {
          return;
        }

        // cache latest content
        cachedContent[type] = e.target.value;

        // trigger the change event
        this.trigger('change', {
          type: type,
          file: data(e.target, 'jotted-file'),
          content: cachedContent[type]
        });
      }
    }, {
      key: 'errors',
      value: function errors(errs, params) {
        this.status('error', errs, params);
      }
    }, {
      key: 'pane',
      value: function pane(e) {
        if (!data(e.target, 'jotted-type')) {
          return;
        }

        var $container = this._get('$container');
        var paneActive = this._get('paneActive');
        removeClass($container, paneActiveClass(paneActive));

        paneActive = this._set('paneActive', data(e.target, 'jotted-type'));
        addClass($container, paneActiveClass(paneActive));

        e.preventDefault();
      }
    }, {
      key: 'status',
      value: function status() {
        var statusType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'error';
        var messages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!messages.length) {
          return this.clearStatus(statusType, params);
        }

        var $status = this._get('$status');

        // add error/loading class to status
        addClass($status[params.type], statusClass(statusType));

        addClass(this._get('$container'), statusActiveClass(params.type));

        var markup = '';
        messages.forEach(function (err) {
          markup += statusMessage(err);
        });

        $status[params.type].innerHTML = markup;
      }
    }, {
      key: 'clearStatus',
      value: function clearStatus(statusType, params) {
        var $status = this._get('$status');

        removeClass($status[params.type], statusClass(statusType));
        removeClass(this._get('$container'), statusActiveClass(params.type));
        $status[params.type].innerHTML = '';
      }

      // debounced trigger method
      // custom debouncer to use a different timer per type

    }, {
      key: 'trigger',
      value: function trigger() {
        var options = this._get('options');
        var pubsoup = this._get('pubsoup');

        // allow disabling the trigger debouncer.
        // mostly for testing: when trigger events happen rapidly
        // multiple events of the same type would be caught once.
        if (options.debounce === false) {
          return function () {
            pubsoup.publish.apply(pubsoup, arguments);
          };
        }

        // cooldown timer
        var cooldown = {};
        // multiple calls
        var multiple = {};

        return function (topic) {
          var _arguments = arguments;

          var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var _ref$type = _ref.type;
          var type = _ref$type === undefined ? 'default' : _ref$type;

          if (cooldown[type]) {
            // if we had multiple calls before the cooldown
            multiple[type] = true;
          } else {
            // trigger immediately once cooldown is over
            pubsoup.publish.apply(pubsoup, arguments);
          }

          clearTimeout(cooldown[type]);

          // set cooldown timer
          cooldown[type] = setTimeout(function () {
            // if we had multiple calls before the cooldown,
            // trigger the function again at the end.
            if (multiple[type]) {
              pubsoup.publish.apply(pubsoup, _arguments);
            }

            multiple[type] = null;
            cooldown[type] = null;
          }, options.debounce);
        };
      }
    }]);
    return Jotted;
  }();

  // register plugins


  Jotted.plugin = function () {
    return register.apply(this, arguments);
  };

  // register bundled plugins
  BundlePlugins(Jotted);

  return Jotted;

})));

//# sourceMappingURL=jotted.js.map