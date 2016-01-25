/* core tests
 */

describe('Core', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  function cleanDom () {
    if (dom.$editor) {
      dom.$editor.parentNode.removeChild(dom.$editor)
    }

    dom.$editor = document.createElement('div')

    document.querySelector('.fixture').appendChild(dom.$editor)
  }

  beforeAll(cleanDom)

  it('should initialize jotted on #editor-core', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(jotted.core).toBeDefined()
  })

  it('should add the jotted class to the container', function () {
    expect(dom.$editor.className).toContain('jotted')
  })

  it('should add the navigation markup', function () {
    expect(dom.$editor.querySelector('.jotted-nav')).not.toBe(null)
  })

  it('should add four panes', function () {
    expect(dom.$editor.querySelectorAll('.jotted-pane').length).toBe(4)
  })

  it('should create three editor containers', function () {
    expect(dom.$editor.querySelectorAll('.jotted-editor').length).toBe(3)
  })

  it('should create three editor textareas', function () {
    expect(dom.$editor.querySelectorAll('.jotted-editor textarea').length).toBe(3)
  })

  it('should create the result iframe', function () {
    expect(dom.$editor.querySelector('.jotted-pane-result iframe')).not.toBe(null)
  })

  it('should have the result pane visible', function () {
    expect(window.getComputedStyle(dom.$editor.querySelector('.jotted-pane-result')).getPropertyValue('visibility')).toBe('visible')
  })

  it('should have the other panes hidden', function () {
    var $panes = dom.$editor.querySelectorAll('.jotted-pane')
    for (var i = 1; i < $panes.length; i++) {
      expect(window.getComputedStyle($panes[i]).getPropertyValue('visibility')).toBe('hidden')
    }
  })

  it('should contain the pubsoup methods', function () {
    [ 'on', 'off', 'done', 'trigger' ].forEach(function (key) {
      expect(typeof jotted.core[key]).toBeDefined()
    })
  })

  it('should throw error when jotted container is not found', function () {
    try {
      jotted._nonexistant = new Jotted(document.getElementById('editor-nonexistant'))
    } catch (e) {
      expect(e.toString()).toContain('Can\'t find Jotted container')
    }
  })

  it('should refresh the entire iframe on each change', function () {
    cleanDom()
    jotted.core = new Jotted(dom.$editor, {
      files: [{
        type: 'html',
        content: '<h1>Default Heading</h1>'
      }, {
        type: 'js',
        content: ''
      }]
    })

    var changeEvent = document.createEvent('Event')
    changeEvent.initEvent('DOMContentLoaded', true, true)

    var $textareaJS = dom.$editor.querySelector('.jotted-pane-js textarea')
    $textareaJS.value = 'document.querySelector("h1").innerHTML = "Different Heading"'
    $textareaJS.dispatchEvent(changeEvent)

    $textareaJS.value = ''
    $textareaJS.dispatchEvent(changeEvent)

    expect(dom.$editor.querySelector('.jotted-pane-result iframe').contentWindow.document.querySelector('h1').innerHTML).toBe('Default Heading')
  })

  it('should show all pane nav tabs when using showBlank', function () {
    cleanDom()
    jotted.core = new Jotted(dom.$editor, {
      showBlank: true
    })

    var $navs = dom.$editor.querySelectorAll('.jotted-nav-item')
    for (var i = 0; i < $navs.length; i++) {
      expect($navs[i].offsetParent).not.toBe(null)
    }
  })
})
