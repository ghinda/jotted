/* template
 */

export function container () {
  return `
    <ul class="jotted-nav">
      <li class="jotted-nav-result">
        <a href="#">
          Result
        </a>
      </li>
      <li class="jotted-nav-html">
        <a href="#">
          HTML
        </a>
      </li>
      <li class="jotted-nav-css">
        <a href="#">
          CSS
        </a>
      </li>
      <li class="jotted-nav-js">
        <a href="#">
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

export function containerClass () {
  return `jotted`
}

export function showBlankClass () {
  return `jotted-show-blank`
}

export function hasFileClass (type) {
  return `jotted-has-${type}`
}

export function editorClass (type) {
  return `jotted-editor-${type}`
}

export function editorContent (type, file) {
  return `
    <textarea data-type="${type}" data-file="${file}"></textarea>
  `
}
