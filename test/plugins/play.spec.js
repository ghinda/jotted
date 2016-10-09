/* play plugin tests
 */

describe('Play Plugin', function () {
  'use strict'

  var dom = {}
  var Jotted = window.Jotted
  var jotted = {}

  beforeEach(function () {
    if (dom.$play) {
      dom.$play.parentNode.removeChild(dom.$play)
    }

    dom.$play = document.createElement('div')

    document.querySelector('.fixtures').appendChild(dom.$play)
  })

  it('should add a Run button', function () {
    jotted.play = new Jotted(dom.$play, {
      plugins: ['play']
    })

    expect(dom.$play.querySelector('.jotted-button-play')).to.not.equal(null)
  })

  it('should not update content on change', function (done) {
    jotted.play = new Jotted(dom.$play, {
      files: [{
        type: 'html',
        content: '<h1>Original</h1>'
      }],
      plugins: ['play']
    })

    var changeEvent = document.createEvent('Event')
    changeEvent.initEvent('change', true, true)

    var changeText = function () {
      jotted.play.off('change', changeText)
      jotted.play.done('change', checkContent)

      var $textareaHTML = dom.$play.querySelector('.jotted-pane-html textarea')
      $textareaHTML.value = '<h1>Changed Text</h1>'
      $textareaHTML.dispatchEvent(changeEvent)
    }

    var checkContent = function () {
      jotted.play.off('change', checkContent)

      expect(dom.$play.querySelector('.jotted-pane-result   iframe').contentWindow.document.querySelector('h1').innerHTML).to.equal('Original')
      done()
    }

    jotted.play.done('change', changeText)
  })

  it('should update content on Run button click', function (done) {
    jotted.play = new Jotted(dom.$play, {
      files: [{
        type: 'html',
        content: '<h1>Original</h1>'
      }],
      plugins: ['play'],
      debounce: false
    })

    var changeEvent = document.createEvent('Event')
    changeEvent.initEvent('change', true, true)

    var clickEvent = document.createEvent('Event')
    clickEvent.initEvent('click', true, true)

    var $textareaHTML = dom.$play.querySelector('.jotted-pane-html textarea')

    var change1 = function () {
      jotted.play.off('change', change1)
      jotted.play.done('change', change2)

      $textareaHTML.value = '<h1>Changed Text</h1>'
      $textareaHTML.dispatchEvent(changeEvent)
    }

    var change2 = function (errs, params) {
      jotted.play.off('change', change2)
      jotted.play.done('change', checkContent)

      dom.$play.querySelector('.jotted-button-play').dispatchEvent(clickEvent)
    }

    var checkContent = function (errs, params) {
      jotted.play.off('change', checkContent)

      expect(dom.$play.querySelector('.jotted-pane-result   iframe').contentWindow.document.querySelector('h1').innerHTML).to.equal('Changed Text')
      done()
    }

    jotted.play.done('change', change1)
  })

  it('should start with blank content when setting firstRun', function (done) {
    jotted.play = new Jotted(dom.$play, {
      files: [{
        type: 'html',
        content: '<h1>Initial</h1>'
      }],
      plugins: [{
        name: 'play',
        options: {
          firstRun: false
        }
      }],
      debounce: false
    })

    var checkContent = function (errs, params) {
      jotted.play.off('change', checkContent)

      expect(dom.$play.querySelector('.jotted-pane-result   iframe').contentWindow.document.querySelector('h1')).to.be.null
      done()
    }

    jotted.play.done('change', checkContent)
  })

  it('should show initial content on Run button press, when using firstRun', function (done) {
    jotted.play = new Jotted(dom.$play, {
      files: [{
        type: 'html',
        content: '<h1>Initial</h1>'
      }],
      plugins: [{
        name: 'play',
        options: {
          firstRun: false
        }
      }],
      debounce: false
    })

    var clickEvent = document.createEvent('Event')
    clickEvent.initEvent('click', true, true)

    var change1 = function () {
      jotted.play.off('change', change1)
      jotted.play.done('change', checkContent)

      dom.$play.querySelector('.jotted-button-play').dispatchEvent(clickEvent)
    }

    var checkContent = function (errs, params) {
      jotted.play.off('change', checkContent)

      expect(dom.$play.querySelector('.jotted-pane-result   iframe').contentWindow.document.querySelector('h1').innerHTML).to.equal('Initial')
      done()
    }

    jotted.play.done('change', change1)
  })
})
