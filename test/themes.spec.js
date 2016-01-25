/* themes tests
 */

describe('Themes', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeAll(function () {
    dom.$editor = document.createElement('div')

    document.querySelector('.fixture').appendChild(dom.$editor)
  })

  it('should have all panes visible on the bin theme', function () {
    dom.$editor.className = 'jotted-theme-bin'
    jotted.core = new Jotted(dom.$editor)

    var $panes = dom.$editor.querySelectorAll('.jotted-pane')
    for (var i = 0; i < $panes.length; i++) {
      expect(window.getComputedStyle($panes[i]).getPropertyValue('visibility')).toBe('visible')
    }
  })
})
