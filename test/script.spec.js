/* script tag runner tests
 */

describe('Script', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeAll(function () {
    dom.$scriptType = document.getElementById('editor-script-type')
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
})
