/* core tests
 */

describe('Core', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeEach(function () {
    if (dom.$editor) {
      dom.$editor.parentNode.removeChild(dom.$editor)
    }

    dom.$editor = document.createElement('div')

    document.querySelector('.fixtures').appendChild(dom.$editor)
  })

  it('should initialize jotted on #editor-core', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(jotted.core).to.not.be.undefined
  })

  it('should add the jotted class to the container', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(dom.$editor.className).to.contain('jotted')
  })

  it('should add the navigation markup', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(dom.$editor.querySelector('.jotted-nav')).to.not.be.null
  })

  it('should add four panes', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(dom.$editor.querySelectorAll('.jotted-pane').length).to.equal(4)
  })

  it('should create three editor containers', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(dom.$editor.querySelectorAll('.jotted-editor').length).to.equal(3)
  })

  it('should create three editor textareas', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(dom.$editor.querySelectorAll('.jotted-editor textarea').length).to.equal(3)
  })

  it('should create the result iframe', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(dom.$editor.querySelector('.jotted-pane-result iframe')).to.not.be.null
  })

  it('should have the result pane visible', function () {
    jotted.core = new Jotted(dom.$editor)

    expect(window.getComputedStyle(dom.$editor.querySelector('.jotted-pane-result')).getPropertyValue('visibility')).to.equal('visible')
  })

  it('should have the other panes hidden', function () {
    jotted.core = new Jotted(dom.$editor)

    var $panes = dom.$editor.querySelectorAll('.jotted-pane')
    for (var i = 1; i < $panes.length; i++) {
      expect(window.getComputedStyle($panes[i]).getPropertyValue('visibility')).to.equal('hidden')
    }
  })

  it('should contain the pubsoup methods', function () {
    jotted.core = new Jotted(dom.$editor)

    var props = [ 'on', 'off', 'done', 'trigger' ]

    props.forEach(function (key) {
      expect(typeof jotted.core[key]).to.not.be.undefined
    })
  })

  it('should throw error when jotted container is not found', function () {
    jotted.core = new Jotted(dom.$editor)

    try {
      jotted._nonexistant = new Jotted(document.getElementById('editor-nonexistant'))
    } catch (e) {
      expect(e.toString()).to.contain('Can\'t find Jotted container')
    }
  })

  it('should refresh the entire iframe on each change', function (done) {
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
    changeEvent.initEvent('change', true, true)

    var $textareaJS = dom.$editor.querySelector('.jotted-pane-js textarea')

    // first render
    var change1 = function () {
      jotted.core.off('change', change1)
      jotted.core.done('change', change2)

      $textareaJS.value = 'document.querySelector("h1").innerHTML = "Different Heading"'
      $textareaJS.dispatchEvent(changeEvent)
    }

    // second render
    var change2 = function () {
      jotted.core.off('change', change2)
      jotted.core.done('change', checkContent)

      $textareaJS.value = ''
      $textareaJS.dispatchEvent(changeEvent)
    }

    var checkContent = window.util.check(done, function () {
      expect(dom.$editor.querySelector('.jotted-pane-result iframe').contentWindow.document.querySelector('h1').innerHTML).to.equal('Default Heading')
    })

    jotted.core.done('change', change1)
  })

  it('should show all pane nav tabs when using showBlank', function () {
    jotted.core = new Jotted(dom.$editor, {
      showBlank: true
    })

    var $navs = dom.$editor.querySelectorAll('.jotted-nav-item')
    for (var i = 0; i < $navs.length; i++) {
      expect($navs[i].offsetParent).to.not.be.null
    }
  })
})
