/* console plugin
 */

import * as util from '../util.js'

export default class PluginConsole {
  constructor (jotted, options) {
    options = util.extend(options, {
      autoClear: false
    })

    var priority = 30
    var history = []
    var historyIndex = 0

    var $iframe = jotted.$container.querySelector('.jotted-pane-result iframe')

    // new tab and pane markup
    var $nav = document.createElement('li')
    util.addClass($nav, 'jotted-nav-item jotted-nav-item-console')
    $nav.innerHTML = '<a href="#" data-jotted-type="console">JS Console</a>'

    var $pane = document.createElement('div')
    util.addClass($pane, 'jotted-pane jotted-pane-console')

    $pane.innerHTML = `
      <div class="jotted-console-container">
        <ul class="jotted-console-output"></ul>
        <form class="jotted-console-input">
          <input type="text">
        </form>
      </div>
      <button class="jotted-button jotted-console-clear">Clear</button>
    `

    jotted.$container.appendChild($pane)
    jotted.$container.querySelector('.jotted-nav').appendChild($nav)

    var $container = jotted.$container.querySelector('.jotted-console-container')
    var $output = jotted.$container.querySelector('.jotted-console-output')
    var $input = jotted.$container.querySelector('.jotted-console-input input')
    var $inputForm = jotted.$container.querySelector('.jotted-console-input')
    var $clear = jotted.$container.querySelector('.jotted-console-clear')

    // submit the input form
    $inputForm.addEventListener('submit', this.submit.bind(this))

    // console history
    $input.addEventListener('keydown', this.history.bind(this))

    // clear button
    $clear.addEventListener('click', this.clear.bind(this))

    // clear the console on each change
    if (options.autoClear === true) {
      jotted.on('change', this.autoClear.bind(this), priority - 1)
    }

    // capture the console on each change
    jotted.on('change', this.change.bind(this), priority)

    // get log events from the iframe
    window.addEventListener('message', this.getMessage.bind(this))

    // plugin public properties
    this.$container = $container
    this.$input = $input
    this.$output = $output
    this.$iframe = $iframe
    this.history = history
    this.historyIndex = historyIndex
  }

  getMessage (e) {
    // only catch messages from the iframe
    if (e.source !== this.$iframe.contentWindow) {
      return
    }

    var data = JSON.parse(e.data)
    if (data.type === 'jotted-console-log') {
      this.log(data.message)
    }
  }

  autoClear (params, callback) {
    this.clear()

    callback(null, params)
  }

  change (params, callback) {
    // only parse js content
    if (params.type !== 'js') {
      // make sure we callback either way,
      // to not break the pubsoup
      return callback(null, params)
    }

    params.content = `(${this.capture.toString()})();\n${params.content}`

    callback(null, params)
  }

  // capture the console.log output
  capture () {
    // IE9 with devtools closed
    if (typeof window.console === 'undefined' || typeof window.console.log === 'undefined') {
      window.console = {
        log: function () {}
      }
    }

    // for IE9 support
    var oldConsoleLog = Function.prototype.bind.call(window.console.log, window.console)

    window.console.log = function () {
      // send log messages to the parent window
      [].slice.call(arguments).forEach(function (message) {
        window.parent.postMessage(JSON.stringify({
          type: 'jotted-console-log',
          message: message
        }), '*')
      })

      // in IE9, console.log is object instead of function
      // https://connect.microsoft.com/IE/feedback/details/585896/console-log-typeof-is-object-instead-of-function
      oldConsoleLog.apply(oldConsoleLog, arguments)
    }
  }

  log (message = '', type) {
    var $log = document.createElement('li')
    util.addClass($log, 'jotted-console-log')

    if (typeof type !== 'undefined') {
      util.addClass($log, `jotted-console-log-${type}`)
    }

    $log.innerHTML = message

    this.$output.appendChild($log)
  }

  submit (e) {
    var inputValue = this.$input.value.trim()

    // if input is blank, do nothing
    if (inputValue === '') {
      return e.preventDefault()
    }

    // add run to history
    this.history.push(inputValue)
    this.historyIndex = this.history.length

    // log input value
    this.log(inputValue, 'history')

    // add return if it doesn't start with it
    if (inputValue.indexOf('return') !== 0) {
      inputValue = 'return ' + inputValue
    }

    // show output or errors
    try {
      // run the console input in the iframe context
      var scriptOutput = this.$iframe.contentWindow.eval(`(function() {${inputValue}})()`)

      this.log(scriptOutput)
    } catch (err) {
      this.log(err, 'error')
    }

    // clear the console value
    this.$input.value = ''

    // scroll console pane to bottom
    // to keep the input into view
    this.$container.scrollTop = this.$container.scrollHeight

    e.preventDefault()
  }

  clear () {
    this.$output.innerHTML = ''
  }

  history (e) {
    var UP = 38
    var DOWN = 40
    var gotHistory = false
    var selectionStart = this.$input.selectionStart

    // only if we have previous history
    // and the cursor is at the start
    if (e.keyCode === UP && this.historyIndex !== 0 && selectionStart === 0) {
      this.historyIndex--
      gotHistory = true
    }

    // only if we have future history
    // and the cursor is at the end
    if (e.keyCode === DOWN && this.historyIndex !== this.history.length - 1 && selectionStart === this.$input.value.length) {
      this.historyIndex++
      gotHistory = true
    }

    // only if history changed
    if (gotHistory) {
      this.$input.value = this.history[this.historyIndex]
    }
  }
}
