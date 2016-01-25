/* bin theme tests
 */

describe('Bin Theme', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeEach(function () {
    if (dom.$editor) {
      dom.$editor.parentNode.removeChild(dom.$editor)
    }
    dom.$editor = document.createElement('div')
    dom.$editor.className = 'jotted-theme-bin'

    document.querySelector('.fixture').appendChild(dom.$editor)
  })

  it('should have all panes visible on the bin theme when using showBlank', function () {
    jotted.core = new Jotted(dom.$editor, {
      showBlank: true
    })

    var $panes = dom.$editor.querySelectorAll('.jotted-pane')
    for (var i = 0; i < $panes.length; i++) {
      expect(window.getComputedStyle($panes[i]).getPropertyValue('visibility')).toBe('visible')
    }
  })

  it('should take up 50% of the container with one file types', function () {
    jotted.core = new Jotted(dom.$editor, {
      files: [{
        type: 'html',
        content: ''
      }]
    })

    var $paneHtml = dom.$editor.querySelector('.jotted-pane-html')
    var containerWidth = parseInt(window.getComputedStyle(dom.$editor).getPropertyValue('width'), 10)
    var paneWidth = parseInt(window.getComputedStyle($paneHtml).getPropertyValue('width'), 10)
    expect(paneWidth).toBe((containerWidth - 2) / 2)
  })
})
