/* template
 */

export function container () {
  return `
    <ul class="jotted-nav">
      <li>
        <a href="#">
          Result
        </a>
      </li>
      <li>
        <a href="#">
          HTML
        </a>
      </li>
      <li>
        <a href="#">
          CSS
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

export function editorClass (type, id) {
  return `jotted-editor-${type} jotted-editor-${type}--${id}`
}

export function editorContent () {
  return `
    <textarea></textarea>
  `
}
