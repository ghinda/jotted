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
    Array.prototype.slice.call(this._querySelectorAll('.jotted-editor')).forEach(function (editor) {
      let $colexpandElement = document.createElement('div')
      $colexpandElement.classList.add('jotted-col-expand')

      let $paneNavItem = editor.parentElement.querySelector('.jotted-pane-title')
      editor.parentElement.insertBefore($colexpandElement, $paneNavItem)
    })

    // first: result pane
    this.panes = [{
      nav: this._querySelector('.jotted-pane-title-result'),
      pane: this._querySelector('.jotted-pane-result'),
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

    $pane.startX = event.clientX
    $pane.startWidth = parseFloat(getComputedStyle($pane.container).getPropertyValue('width'), 10)

    $previousPane.startX = event.clientX
    $previousPane.startWidth = parseFloat(getComputedStyle($previousPane.container).getPropertyValue('width'), 10)

    $fixedSizePane.startWidth = parseFloat(getComputedStyle($fixedSizePane.container).getPropertyValue('width'), 10)

    $pane.mousemove = this.doDrag.bind(this, $pane, $previousPane, $fixedSizePane)
    $pane.mouseup = this.stopDrag.bind(this, $pane)

    document.addEventListener('mousemove', $pane.mousemove, false)
    document.addEventListener('mouseup', $pane.mouseup, false)
  }

  doDrag (pane, previousPane, fixedSizePane, event) {
    // previous pane
    let ppNewWidth = (previousPane.startWidth + event.clientX - pane.startX)

    // current pane
    let cpNewWidth = (pane.startWidth - event.clientX + pane.startX)

    // contracting a pane are restricted to a min-size of 100px.
    const PANE_MIN_SIZE = 100
    if (ppNewWidth >= PANE_MIN_SIZE && cpNewWidth >= PANE_MIN_SIZE) {
      [pane, previousPane, fixedSizePane]
        .forEach((p) => { this.overrideFixedSizeAttributes(p) })

      previousPane.container.style.width = `${ppNewWidth}px`
      pane.container.style.width = `${cpNewWidth}px`
      fixedSizePane.container.style.width = `${fixedSizePane.startWidth}px`
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

