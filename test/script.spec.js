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

    document.querySelector('.fixture').appendChild(dom.$script)
  })

  it('should not run script tags when runScripts is false', function () {
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

    expect(dom.$script.querySelector('iframe').contentWindow.globalThatShouldntExist).not.toBeDefined()
  })

  it('should run script tags with no type attribute', function () {    
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

    expect(dom.$script.querySelector('iframe').contentWindow.globalThatShouldExist).toBe(true)
  })

  it('should run script tags with text/javascript type attribute', function () {
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

    expect(dom.$script.querySelector('iframe').contentWindow.globalThatShouldExist).toBe(true)
  })

  it('should not run script tags with type attribute other than text/javascript', function () {
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

    expect(dom.$script.querySelector('iframe').contentWindow.globalThatShouldntExist).not.toBeDefined()
  })

  it('should re-trigger DOMContentLoaded after all scripts finished loading', function (done) {
    // that's the default browser behavior,
    // and some loaded scripts could rely on it.
    jotted.script = new Jotted(dom.$script, {
      files: [{
        type: 'html',
        content: '<script src="https://fb.me/react-0.14.6.js"></script><script src="https://fb.me/react-dom-0.14.6.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.js"></script><div id="content"></div><script language="javascript" type="text/babel">ReactDOM.render(<span>Hello, world!</span>, document.getElementById("content"));</script>'
      }]
    })

    // firefox triggers DOMContentLoaded immediately
    // delay the event listener so we only catch the DOMContentLoaded
    // triggered by jotted after the scripts are loaded.
    setTimeout(function () {
      var $frame = dom.$script.querySelector('iframe').contentWindow
      $frame.addEventListener('DOMContentLoaded', function () {
        // give it a sec for react to render
        setTimeout(function () {
          expect($frame.document.querySelector('#content').textContent).toContain('Hello, world!')

          done()
        })
      })
    })
  })

  it('should run js only after all inline scripts are loaded', function (done) {
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

    // firefox triggers DOMContentLoaded immediately
    // delay the event listener so we only catch the DOMContentLoaded
    // triggered by jotted after the scripts are loaded.
    setTimeout(function () {
      var $frame = dom.$script.querySelector('iframe').contentWindow
      $frame.addEventListener('DOMContentLoaded', function () {
        // give it a sec for react to render
        setTimeout(function () {
          expect($frame.document.querySelector('#content').textContent).toContain('Hello, world!')

          done()
        })
      })
    })
  })
})
