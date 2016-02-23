/* test utils
 */

window.util = (function () {
  function check (done, fn) {
    var scope = this

    return function () {
      var args = arguments

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
