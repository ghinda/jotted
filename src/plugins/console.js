/* console plugin
 */

import * as util from '../util.js'

export default class PluginConsole {
  constructor (jotted, options) {
    var priority = 30

    options = util.extend(options, {})

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
    `

    jotted.$container.appendChild($pane)
    jotted.$container.querySelector('.jotted-nav').appendChild($nav)

    var $output = jotted.$container.querySelector('.jotted-console-output')
    var $input = jotted.$container.querySelector('.jotted-console-input input')
    var $inputForm = jotted.$container.querySelector('.jotted-console-input')

    // submit the input form
    $inputForm.addEventListener('submit', this.submit.bind(this))

    // capture the console on each change
    jotted.on('change', this.change.bind(this), priority)

    // get log events from the iframe
    window.addEventListener('message', this.getMessage.bind(this))

    // plugin public properties
    this.$input = $input
    this.$output = $output
    this.$iframe = $iframe
  }

  getMessage (e) {
    // only catch messages from the iframe
    if (e.source !== this.$iframe.contentWindow) {
      return
    }

    var data = e.data
    if (data.type === 'jotted-console-log') {
      this.log(data.message)
    }
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
    // for IE9 support
    var oldConsoleLog = Function.prototype.bind.call(window.console.log, window.console)

    window.console.log = function () {
      // send log messages to the parent window
      [].slice.call(arguments).forEach(function (message) {
        window.parent.postMessage({
          type: 'jotted-console-log',
          message: message
        }, '*')
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

    e.preventDefault()
  }
}
