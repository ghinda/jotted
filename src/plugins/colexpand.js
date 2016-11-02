/* eslint-env browser */

/* colexpand plugin
 * adds a column expand functionality to the panes
 */
import * as util from '../util.js'

export default class PluginColExpand {
  constructor (jotted, options) {
    this.jotted = jotted

    options = util.extend(options, {})

    this._querySelector = jotted.$container.querySelector.bind(jotted.$container)
    this._querySelectorAll = jotted.$container.querySelectorAll.bind(jotted.$container)

    // insert expander elements
    // splice: skips first pane as it should not have a expander
    Array.prototype.slice.call(this._querySelectorAll('.jotted-editor')).splice(1).forEach(function (editor) {
      let $colexpandElement = document.createElement('div')
      $colexpandElement.classList.add('jotted-col-expand')

      let $paneNavItem = editor.parentElement.querySelector('.jotted-pane-title')
      editor.parentElement.insertBefore($colexpandElement, $paneNavItem)
    })

    // first: result pane
    this.panes = [{
      nav: this._querySelector('.jotted-pane-title-result'),
      container: this._querySelector('.jotted-pane-result'),
      expander: undefined
    }]

    // code panes
    for (let type of [ 'html', 'css', 'js' ]) {
      let $paneType = this._querySelector(`.jotted-pane-${type}`)
      let $pane = {
        nav: this._querySelector(`.jotted-pane-title-${type}`),
        container: this._querySelector(`.jotted-pane-${type}`),
        expander: $paneType.querySelector('.jotted-col-expand')
      }

      this.panes.push($pane)

      if ($pane.expander)
        $pane.expander.addEventListener('mousedown', this.startExpand.bind(this, jotted))
    }

    jotted.$container.style.display = ''
  }

  startExpand (jotted, event) {
    let $pane = this.panes
      .filter((pane) => { return pane.expander === event.target })
      .shift()

    let $previousPane = this.panes[this.panes.indexOf($pane) - 1]

    let $fixedSizePane = this.panes
      .filter((pane) => { return pane !== $pane && pane !== $previousPane })
      .pop()

    let $relativePixel = 100 / parseInt(getComputedStyle($pane.container.parentNode)['width'], 10)

    // ugly but reliable/cross-browser way of getting height/width as percentage.
    $pane.container.parentNode.style.display = 'none'

    $pane.startX = event.clientX
    $pane.startWidth = parseFloat(getComputedStyle($pane.container)['width'], 10)
    $previousPane.startWidth = parseFloat(getComputedStyle($previousPane.container)['width'], 10)
    $fixedSizePane.startWidth = parseFloat(getComputedStyle($fixedSizePane.container)['width'], 10)

    $pane.container.parentNode.style.display = ''

    $pane.mousemove = this.doDrag.bind(this, $pane, $previousPane, $fixedSizePane, $relativePixel)
    $pane.mouseup = this.stopDrag.bind(this, $pane)

    document.addEventListener('mousemove', $pane.mousemove, false)
    document.addEventListener('mouseup', $pane.mouseup, false)
  }

  doDrag (pane, previousPane, fixedSizePane, relativePixel, event) {
    // previous pane
    let ppNewWidth = previousPane.startWidth + ((event.clientX - pane.startX) * relativePixel)
    console.log(`previous: ${ previousPane.startWidth } + ((${ event.clientX } - ${ pane.startX }) * ${ relativePixel }) = ${ppNewWidth}`)

    // current pane
    let cpNewWidth = pane.startWidth - ((event.clientX - pane.startX) * relativePixel)
    console.log(`current: ${ pane.startWidth } - ((${ event.clientX } - ${ pane.startX }) * ${ relativePixel }) = ${cpNewWidth}`)

    const PANE_MIN_SIZE = 10 // percent

    // contracting a pane are restricted to a min-size of 10% the space.
    if (ppNewWidth >= PANE_MIN_SIZE && cpNewWidth >= PANE_MIN_SIZE) {
      [pane, previousPane, fixedSizePane]
        .forEach((p) => { this.overrideFixedSizeAttributes(p) })

      previousPane.container.style.width = `${ppNewWidth}%`
      pane.container.style.width = `${cpNewWidth}%`
      fixedSizePane.container.style.width = `${fixedSizePane.startWidth}%`
    }
  }

  stopDrag (pane, event) {
    document.removeEventListener('mousemove', pane.mousemove, false)
    document.removeEventListener('mouseup', pane.mouseup, false)
  }

  overrideFixedSizeAttributes (pane) {
    pane.container.style.flex = '0 0 auto'
    pane.container.style.maxWidth = 'none'
  }
}

