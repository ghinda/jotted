/* console plugin tests
 */

describe('Console Plugin', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeEach(function () {
    if (dom.$console) {
      dom.$console.parentNode.removeChild(dom.$console)
    }

    dom.$console = document.createElement('div')

    document.querySelector('.fixtures').appendChild(dom.$console)
  })

  it('should add a new tab', function () {
    jotted.console = new Jotted(dom.$console, {
      plugins: ['console']
    })

    expect(dom.$console.querySelector('.jotted-nav-item-console')).to.not.equal(null)
  })

  it('should add a new pane', function () {
    jotted.console = new Jotted(dom.$console, {
      plugins: ['console']
    })

    expect(dom.$console.querySelector('.jotted-pane-console')).to.not.equal(null)
  })

  it('should show logs', function () {
    jotted.console = new Jotted(dom.$console, {
      plugins: ['console']
    })

    var $input = dom.$console.querySelector('.jotted-console-input input')
    $input.value = '"someString"'

    var submitEvent = document.createEvent('Event')
    submitEvent.initEvent('submit', true, true)

    dom.$console.querySelector('.jotted-console-input').dispatchEvent(submitEvent)

    expect(dom.$console.querySelector('.jotted-console-output').innerHTML).to.contain('"someString"')
  })

  it('should catch errors', function () {
    jotted.console = new Jotted(dom.$console, {
      plugins: ['console']
    })

    var $input = dom.$console.querySelector('.jotted-console-input input')
    $input.value = 'someVar'

    var submitEvent = document.createEvent('Event')
    submitEvent.initEvent('submit', true, true)

    dom.$console.querySelector('.jotted-console-input').dispatchEvent(submitEvent)

    expect(dom.$console.querySelector('.jotted-console-log-error')).to.not.equal(null)
  })

  it('should capture console.logs', function (done) {
    jotted.console = new Jotted(dom.$console, {
      files: [{
        type: 'js',
        content: 'console.log("someString")'
      }],
      plugins: ['console']
    })

    var $iframe = dom.$console.querySelector('iframe')
    $iframe.onload = function () {
      // give it a second for the postMessage to go around
      setTimeout(function () {
        expect(dom.$console.querySelector('.jotted-console-output').innerHTML).to.contain('someString')

        done()
      }, 200)
    }
  })
})
