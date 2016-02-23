/* test utils
 */

window.util = (function () {
  function check (done, fn) {
    var args = arguments
    var scope = this

    return function () {
      try {
        fn.apply(scope, args)
        done()
      } catch (err) {
        done(err)
      }
    }
  }

  return {
    check: check
  }
}())
