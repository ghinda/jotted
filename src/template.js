/* template
 */

export function container () {
  return `
    <ul class="jotted-nav">
      <li class="jotted-nav-item jotted-nav-item-result">
        <a href="#" data-jotted-type="result">
          Result
        </a>
      </li>
      <li class="jotted-nav-item jotted-nav-item-html">
        <a href="#" data-jotted-type="html">
          HTML
        </a>
      </li>
      <li class="jotted-nav-item jotted-nav-item-css">
        <a href="#" data-jotted-type="css">
          CSS
        </a>
      </li>
      <li class="jotted-nav-item jotted-nav-item-js">
        <a href="#" data-jotted-type="js">
          JavaScript
        </a>
      </li>
    </ul>
    <div class="jotted-pane jotted-pane-result">
      <iframe></iframe>
    </div>
    <div class="jotted-pane jotted-pane-html"></div>
    <div class="jotted-pane jotted-pane-css"></div>
    <div class="jotted-pane jotted-pane-js"></div>
  `
}

export function paneActiveClass (type) {
  return `jotted-pane-active-${type}`
}

export function containerClass () {
  return `jotted`
}

export function showBlankClass () {
  return `jotted-nav-show-blank`
}

export function hasFileClass (type) {
  return `jotted-has-${type}`
}

export function editorClass (type) {
  return `jotted-editor jotted-editor-${type}`
}

export function editorContent (type, fileUrl = '') {
  return `
    <textarea data-jotted-type="${type}" data-jotted-file="${fileUrl}"></textarea>
    <div class="jotted-status"></div>
  `
}

export function statusMessage (err) {
  return `
    <p>${err}</p>
  `
}

export function statusClass (type) {
  return `jotted-status-${type}`
}

export function statusActiveClass (type) {
  return `jotted-status-active-${type}`
}

export function pluginClass (name) {
  return `jotted-plugin-${name}`
}

export function frameContent (body = '') {
  return `
    <!doctype html>
    <html>
    <head>
    </head>
    <body>
    ${body}
    </body>
    </html>
  `
}

export function statusLoading (url) {
  return `Loading <strong>${url}</strong>..`
}

export function statusFetchError (url) {
  return `There was an error loading <strong>${url}</strong>.`
}
