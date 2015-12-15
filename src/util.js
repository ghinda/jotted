/* util
 */

function extend (obj = {}, defaults = {}) {
  var extended = {}
  Object.keys(defaults).forEach(function (key) {
    if (typeof obj[key] !== 'undefined') {
      extended[key] = obj[key]
    } else {
      extended[key] = defaults[key]
    }
  })

  return extended
}

function fetch (file, callback) {
  var xhr = new window.XMLHttpRequest()
  xhr.open('GET', file)
  xhr.responseType = 'text'

  xhr.onload = function () {
    callback(null, xhr.response)
  }

  xhr.onerror = function (err) {
    callback(err)
  }

  xhr.send()
}

function seqRunner (index, params, arr, errors, callback) {
  arr[index](params, function (err, res) {
    if (err) {
      errors.push(err)
    }

    index++
    if (index === arr.length) {
      callback(errors, res)
    } else {
      seqRunner(index, res, arr, errors, callback)
    }
  })
}

function seq (arr, params, callback = function () {}) {
  var errors = []

  if (!arr.length) {
    return callback(errors, params)
  }

  seqRunner(0, params, arr, errors, callback)
}

function debounce (fn, delay) {
  var timer = null
  return function () {
    var context = this
    var args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

function log () {
  console.log(arguments)
}

export {
  extend,
  fetch,
  seq,
  debounce,
  log
}
