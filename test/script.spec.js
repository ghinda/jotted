/* script tag runner tests
 */

describe('Script', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeEach(function () {
    if (dom.$script) {
      dom.$script.parentNode.removeChild(dom.$script)
    }

    dom.$script = document.createElement('div')

    document.querySelector('.fixtures').appendChild(dom.$script)
  })

  it('should not run script tags when runScripts is false', function (done) {
    // to support stuff like inline babel or jsx
    // used with <script type="text/babel">
    jotted.script = new Jotted(dom.$script, {
      runScripts: false,
      files: [{
        type: 'html',
        content: '' +
          '<script type="text/babel">' +
          'window.globalThatShouldntExist = true' +
          '</script>'
      }]
    })

    var $iframe = dom.$script.querySelector('iframe')
    $iframe.onload = function () {
      expect($iframe.contentWindow.globalThatShouldntExist).to.be.undefined
      done()
    }
  })

  it('should run script tags with no type attribute', function (done) {
    // to support stuff like inline babel or jsx
    // used with <script type="text/babel">
    jotted.script = new Jotted(dom.$script, {
      files: [{
        type: 'html',
        content: '' +
          '<script>' +
          'window.globalThatShouldExist = true' +
          '</script>'
      }]
    })

    var $iframe = dom.$script.querySelector('iframe')
    $iframe.onload = function () {
      expect($iframe.contentWindow.globalThatShouldExist).to.be.true
      done()
    }
  })

  it('should run script tags with text/javascript type attribute', function (done) {
    // to support stuff like inline babel or jsx
    // used with <script type="text/babel">
    jotted.script = new Jotted(dom.$script, {
      files: [{
        type: 'html',
        content: '' +
          '<script type="text/javascript">' +
          'window.globalThatShouldExist = true' +
          '</script>'
      }]
    })

    var $iframe = dom.$script.querySelector('iframe')
    $iframe.onload = function () {
      expect(dom.$script.querySelector('iframe').contentWindow.globalThatShouldExist).to.be.true
      done()
    }
  })

  it('should not run script tags with type attribute other than text/javascript', function (done) {
    // to support stuff like inline babel or jsx
    // used with <script type="text/babel">
    jotted.script = new Jotted(dom.$script, {
      files: [{
        type: 'html',
        content: '' +
          '<script type="text/babel">' +
          'window.globalThatShouldntExist = true' +
          '</script>'
      }]
    })

    var $iframe = dom.$script.querySelector('iframe')
    $iframe.onload = function () {
      expect(dom.$script.querySelector('iframe').contentWindow.globalThatShouldntExist).to.be.undefined
      done()
    }
  })

  it('should render inline text/babel jsx with react', function (done) {
    this.timeout(10000)

    jotted.script = new Jotted(dom.$script, {
      files: [{
        type: 'html',
        content: '<script src="https://fb.me/react-0.14.6.js"></script><script src="https://fb.me/react-dom-0.14.6.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.js"></script><div id="content"></div><script language="javascript" type="text/babel">ReactDOM.render(<span>Hello, world!</span>, document.getElementById("content"));</script>'
      }]
    })

    var $iframe = dom.$script.querySelector('iframe')
    $iframe.onload = function () {
      expect($iframe.contentWindow.document.querySelector('#content').textContent).to.contain('Hello, world!')

      done()
    }
  })

  it('should run js only after all inline scripts are loaded', function (done) {
    this.timeout(10000)

    jotted.script = new Jotted(dom.$script, {
      files: [{
        type: 'html',
        content: '<script src="https://fb.me/react-0.14.6.js"></script><script src="https://fb.me/react-dom-0.14.6.js"></script><div id="content"></div>'
      }, {
        type: 'js',
        content: 'ReactDOM.render(<span>Hello, world!</span>,document.getElementById("content"))'
      }],
      plugins: [{
        name: 'babel'
      }]
    })

    var $iframe = dom.$script.querySelector('iframe')
    $iframe.onload = function () {
      expect($iframe.contentWindow.document.querySelector('#content').textContent).to.contain('Hello, world!')

      done()
    }
  })
})
