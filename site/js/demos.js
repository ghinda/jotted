/* Demos
 */

(function() {

  // addEventListener with IE8 support
  var addEventListener = (function() {

    if('addEventListener' in window.Element.prototype) {
      return function(type, listener) {
        this.addEventListener(type, listener, false);
      };
    }

    return function(type, listener) {
      this.attachEvent('on' + type, listener);
    };

  })();

  var toggleClass = function(node, className) {

    var foundClassPosition = node.className.indexOf(className);

    if(foundClassPosition === -1) {
      node.className += ' ' + className;
    } else {

      var tempClass = node.className.substr(0, foundClassPosition - 1);

      node.className = tempClass + node.className.substr(className.length + foundClassPosition);
    }

  };

  var toggleDropdown = function(e) {

    var dropdowns = document.querySelectorAll('.dropdown');
    var i;

    var target = e.target || e.srcElement;

    if(target.className.indexOf('dropdown-button') === -1) {

      // close all dropdowns
      for(i = 0; i < dropdowns.length; i++) {
        if(dropdowns[i].className.indexOf('dropdown-active') !== -1) {
          toggleClass(dropdowns[i], 'dropdown-active');
        }
      }

    } else {

      var dropdown = target.parentNode;

      toggleClass(dropdown, 'dropdown-active');

      e.preventDefault && e.preventDefault();

    }

  };

  var init = function() {
    addEventListener.call(document.body, 'click', toggleDropdown);

    var $jdemo = document.querySelector('.jotted-demo')
    if ($jdemo) {
      // ace demo
      new Jotted($jdemo, {
        files: [
          {
            type: 'html',
            content: document.querySelector('.demo-content').value
          }
        ],
        plugins: [
          'codemirror'
        ]
      })
    }

  };

  init();

})();
