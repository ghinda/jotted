/* core tests
 */

describe('Core', function () {
  'use strict'

  var dom = {}

  beforeAll(function () {
    dom.$editor1 = document.getElementById('editor-1')
  })

  it('should initialize jotted on #editor-1', function () {
    new Jotted(dom.$editor1)

    expect(dom.$editor1.className).toContain('jotted')
  })

  it('should add the navigation markup', function () {
    expect(dom.$editor1.querySelector('.jotted-nav')).not.toBe(null)
  })

  it('should add four panes', function () {
    expect(dom.$editor1.querySelectorAll('.jotted-pane').length).toBe(4)
  })

})
