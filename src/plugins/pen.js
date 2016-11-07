/* pen plugin
 */
export default class PluginPen {
  constructor (jotted, options) {
    // available panes
    let panes = {
      html: { title: 'HTML', classChecker: 'jotted-has-html' },
      css: { title: 'CSS', classChecker: 'jotted-has-css' },
      js: { title: 'JavaScript', classChecker: 'jotted-has-js' },
      console: { title: 'Console', classChecker: 'jotted-plugin-console' }
    }

    let $availablePanes = []
    for (let p in panes) {
      if (jotted.$container.classList.contains(panes[p].classChecker)) {
        $availablePanes.push(jotted.$container.querySelector(`.jotted-pane-${p}`))
      }
    }

    this.resizablePanes = []
    for (let i = 0; i < $availablePanes.length; i++) {
      let type

      for (let j = 0; j < $availablePanes[i].classList.length; j++) {
        if ($availablePanes[i].classList[j].indexOf('jotted-pane-') !== -1) {
          type = $availablePanes[i].classList[j].replace('jotted-pane-', '')
          break
        }
      }

      if (!type) {
        continue
      }

      let $pane = {
        container: $availablePanes[i],
        expander: undefined
      }

      this.resizablePanes.push($pane)

      let $paneTitle = document.createElement('div')
      $paneTitle.classList.add('jotted-pane-title')
      $paneTitle.innerHTML = panes[type].title || type

      let $paneElement = $availablePanes[i].firstElementChild
      $paneElement.insertBefore($paneTitle, $paneElement.firstChild)

      // insert expander element.
      // only panes which have an expander can be shrunk or expanded
      // first pane must not have a expander
      if (i > 0) {
        $pane.expander = document.createElement('div')
        $pane.expander.classList.add('jotted-plugin-pen-expander')
        $pane.expander.addEventListener('mousedown', this.startExpand.bind(this, jotted))

        $paneElement.insertBefore($pane.expander, $paneTitle)
      }
    }
  }

  startExpand (jotted, event) {
    let $pane = this.resizablePanes
      .filter((pane) => { return pane.expander === event.target })
      .shift()

    let $previousPane = this.resizablePanes[this.resizablePanes.indexOf($pane) - 1]

    let $relativePixel = 100 / parseInt(window.getComputedStyle($pane.container.parentNode)['width'], 10)

    // ugly but reliable & cross-browser way of getting height/width as percentage.
    $pane.container.parentNode.style.display = 'none'

    $pane.startX = event.clientX
    $pane.startWidth = parseFloat(window.getComputedStyle($pane.container)['width'], 10)
    $previousPane.startWidth = parseFloat(window.getComputedStyle($previousPane.container)['width'], 10)

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

