/* eslint-env browser */

/* colexpand plugin
 * adds a column expand functionality to the panes
 */
export default class PluginColExpand {
  constructor (jotted, options) {
    this.jotted = jotted

    this._querySelector = jotted.$container.querySelector.bind(jotted.$container)

    // define available panes
    let $availablePanes = []
    if (this.jotted.$container.classList.contains('jotted-has-html')) $availablePanes.push('html')
    if (this.jotted.$container.classList.contains('jotted-has-css')) $availablePanes.push('css')
    if (this.jotted.$container.classList.contains('jotted-has-js')) $availablePanes.push('js')

    this.resizablePanes = []
    for (let i = 0; i < $availablePanes.length; i++) {
      let $type = $availablePanes[i]
      let $pane = {
        nav: this._querySelector(`.jotted-pane-title-${$type}`),
        container: this._querySelector(`.jotted-pane-${$type}`),
        expander: undefined
      }

      this.resizablePanes.push($pane)

      let $paneTitle = document.createElement('div')
      $paneTitle.classList.add('jotted-pane-title')
      $paneTitle.innerHTML = $type === 'js' ? 'JavaScript' : $type.toUpperCase()

      let $paneElement = this._querySelector(`.jotted-pane-${$type} .jotted-editor`)
      $paneElement.insertBefore($paneTitle, $paneElement.firstChild)

      // insert expander element.
      // only panes which have an expander can be shrunk or expanded
      // first pane must not have a expander
      if (i > 0) {
        let $colexpandElement = document.createElement('div')
        $colexpandElement.classList.add('jotted-col-expand')

        $paneElement.insertBefore($colexpandElement, $paneTitle)

        $pane.expander = $colexpandElement
        $pane.expander.addEventListener('mousedown', this.startExpand.bind(this, jotted))
      }
    }
  }

  startExpand (jotted, event) {
    let $pane = this.resizablePanes
      .filter((pane) => { return pane.expander === event.target })
      .shift()

    let $previousPane = this.resizablePanes[this.resizablePanes.indexOf($pane) - 1]

    let $relativePixel = 100 / parseInt(getComputedStyle($pane.container.parentNode)['width'], 10)

    // ugly but reliable & cross-browser way of getting height/width as percentage.
    $pane.container.parentNode.style.display = 'none'

    $pane.startX = event.clientX
    $pane.startWidth = parseFloat(getComputedStyle($pane.container)['width'], 10)
    $previousPane.startWidth = parseFloat(getComputedStyle($previousPane.container)['width'], 10)

    $pane.container.parentNode.style.display = ''

    $pane.mousemove = this.doDrag.bind(this, $pane, $previousPane, $relativePixel)
    $pane.mouseup = this.stopDrag.bind(this, $pane)

    document.addEventListener('mousemove', $pane.mousemove, false)
    document.addEventListener('mouseup', $pane.mouseup, false)
  }

  doDrag (pane, previousPane, relativePixel, event) {
    // previous pane new width
    let ppNewWidth = previousPane.startWidth + ((event.clientX - pane.startX) * relativePixel)

    // current pane new width
    let cpNewWidth = pane.startWidth - ((event.clientX - pane.startX) * relativePixel)

    // contracting a pane is restricted to a min-size of 10% the container's space.
    const PANE_MIN_SIZE = 10 // percentage %
    if (ppNewWidth >= PANE_MIN_SIZE && cpNewWidth >= PANE_MIN_SIZE) {
      pane.container.style.maxWidth = 'none'
      previousPane.container.style.maxWidth = 'none'

      previousPane.container.style.width = `${ppNewWidth}%`
      pane.container.style.width = `${cpNewWidth}%`
    }
  }

  stopDrag (pane, event) {
    document.removeEventListener('mousemove', pane.mousemove, false)
    document.removeEventListener('mouseup', pane.mouseup, false)
  }
}

