/* script tag runner tests
 */

describe('Script', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeAll(function () {
    dom.$scriptType = document.createElement('div')

    document.querySelector('.fixture').appendChild(dom.$scriptType)
  })

  it('should run script tags with no type attribute', function () {
    // to support stuff like inline babel or jsx
    // used with <script type="text/babel">
    jotted.scriptType = new Jotted(dom.$scriptType, {
      files: [{
        type: 'html',
        content: '' +
          '<script>' +
          'window.globalThatShouldExist = true' +
          '</script>'
      }]
    })

    expect(dom.$scriptType.querySelector('iframe').contentWindow.globalThatShouldExist).toBe(true)
  })

  it('should run script tags with text/javascript type attribute', function () {
    // to support stuff like inline babel or jsx
    // used with <script type="text/babel">
    jotted.scriptType = new Jotted(dom.$scriptType, {
      files: [{
        type: 'html',
        content: '' +
          '<script type="text/javascript">' +
          'window.globalThatShouldExist = true' +
          '</script>'
      }]
    })

    expect(dom.$scriptType.querySelector('iframe').contentWindow.globalThatShouldExist).toBe(true)
  })

  it('should not run script tags with type attribute other than text/javascript', function () {
    // to support stuff like inline babel or jsx
    // used with <script type="text/babel">
    jotted.scriptType = new Jotted(dom.$scriptType, {
      files: [{
        type: 'html',
        content: '' +
          '<script type="text/babel">' +
          'window.globalThatShouldntExist = true' +
          '</script>'
      }]
    })

    expect(dom.$scriptType.querySelector('iframe').contentWindow.globalThatShouldntExist).not.toBeDefined()
  })

  it('should re-trigger DOMContentLoaded after all scripts finished loading', function (done) {
    // that's the default browser behavior,
    // and some loaded scripts could rely on it.
    jotted.scriptType = new Jotted(dom.$scriptType, {
      files: [{
        type: 'html',
        content: '<script src="https://fb.me/react-0.14.6.js"></script><script src="https://fb.me/react-dom-0.14.6.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.js"></script><div id="content"></div><script language="javascript" type="text/babel">ReactDOM.render(<span>Hello, world!</span>, document.getElementById("content"));</script>'
      }]
    })

    dom.$scriptType.querySelector('iframe').contentWindow.addEventListener('DOMContentLoaded', function () {
      // give it a sec for react to render
      setTimeout(function () {
        expect(dom.$scriptType.querySelector('iframe').contentWindow.document.querySelector('#content').innerHTML).toContain('Hello, world!')

        done()
      }, 500)
    })
  })
})
