/* util
 */

export function extend (obj = {}, defaults = {}) {
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

export function fetch (file, callback) {
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
