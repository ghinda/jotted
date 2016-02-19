/* util
 */

function extend (obj = {}, defaults = {}) {
  var extended = {}
  // clone object
  Object.keys(obj).forEach(function (key) {
    extended[key] = obj[key]
  })

  // copy default keys where undefined
  Object.keys(defaults).forEach(function (key) {
    if (typeof extended[key] !== 'undefined') {
      extended[key] = obj[key]
    } else {
      extended[key] = defaults[key]
    }
  })

  return extended
}

function fetch (url, callback) {
  var xhr = new window.XMLHttpRequest()
  xhr.open('GET', url)
  xhr.responseType = 'text'

  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(null, xhr.responseText)
    } else {
      callback(url, xhr)
    }
  }

  xhr.onerror = function (err) {
    callback(err)
  }

  xhr.send()
}

function runCallback (index, params, arr, errors, callback) {
  return function (err, res) {
    if (err) {
      errors.push(err)
    }

    index++
    if (index === arr.length) {
      callback(errors, res)
    } else {
      seqRunner(index, res, arr, errors, callback)
    }
  }
}

function seqRunner (index, params, arr, errors, callback) {
  // async
  arr[index](params, runCallback.apply(this, arguments))
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
    clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}

function log () {
  console.log(arguments)
}

function hasClass (node, className) {
  if (!node.className) {
    return false
  }
  var tempClass = ' ' + node.className + ' '
  className = ' ' + className + ' '

  if (tempClass.indexOf(className) !== -1) {
    return true
  }

  return false
}

function addClass (node, className) {
  // class is already added
  if (hasClass(node, className)) {
    return node.className
  }

  if (node.className) {
    className = ' ' + className
  }

  node.className += className

  return node.className
}

function removeClass (node, className) {
  var spaceBefore = ' ' + className
  var spaceAfter = className + ' '

  if (node.className.indexOf(spaceBefore) !== -1) {
    node.className = node.className.replace(spaceBefore, '')
  } else if (node.className.indexOf(spaceAfter) !== -1) {
    node.className = node.className.replace(spaceAfter, '')
  } else {
    node.className = node.className.replace(className, '')
  }

  return node.className
}

function data (node, attr) {
  return node.getAttribute('data-' + attr)
}

// mode detection based on content type and file extension
var defaultModemap = {
  'html': 'html',
  'css': 'css',
  'js': 'javascript',
  'less': 'less',
  'styl': 'stylus',
  'coffee': 'coffeescript'
}

function getMode (type = '', file = '', customModemap = {}) {
  var modemap = extend(customModemap, defaultModemap)

  // try the file extension
  for (let key in modemap) {
    let keyLength = key.length
    if (file.slice(-keyLength++) === '.' + key) {
      return modemap[key]
    }
  }

  // try the file type (html/css/js)
  for (let key in modemap) {
    if (type === key) {
      return modemap[key]
    }
  }

  return type
}

export {
  extend,
  fetch,
  seq,
  debounce,
  log,
  getMode,

  data,
  hasClass,
  addClass,
  removeClass
}
