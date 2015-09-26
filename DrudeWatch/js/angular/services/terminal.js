(function () {

  angular
    .module('dw')
    .factory('$terminal', $terminal);

  function $terminal() {
    var terminals = {};
    return {
      get: get,
      exec: exec
    };

    function get(element_id, cols, rows, startupCommand) {
      terminals[element_id] = {};
      var terminal = terminals[element_id];
      terminal.readonly = false;

      terminal.backend = pty.spawn('bash', [], {
        name: 'xterm',
        cols: cols,
        rows: rows,
        cwd: process.env.HOME,
        env: process.env
      });

      terminal.frontend = new termjs.Terminal({
        useStyle: true,
        visualBell: true,
        geometry: [cols, rows]
      });

      var frontend = terminal.frontend;
      var backend = terminal.backend;

      backend.write('. ~/.bash_profile\r'); // have to source it or it will not be in standalone app

      frontend.on('data', function(data) {
        if (terminal.readonly) return;
        backend.write(data);
      });

      backend.on('data', function(data) {
        frontend.write(data);
      });

      // bind exec to terminal ID
      terminals[element_id].exec = function(command) {
        exec(element_id, command);
      };

      //initiate frontend
      frontend.open(document.getElementById(element_id));
      setTimeout(function () {
        //setup PS1
        //var $PS1 = '\\t \\033[01;34m\\]\\$PWD \\[\\033[00m\\]$ ';
        //backend.write('PS1="' + $PS1 + '"\r');

        backend.write(startupCommand + ' && reset\r')
      }, 1000);
console.log(frontend);
      ////handle resize
      //function fitIn() { //it doesn't work very well though
      //  frontend.resize(jQuery('#'+element_id).parent().width(), jQuery(window).height());
      //  backend.emit('resize');
      //  backend.write('reset\r'); // need to reset or it will be glitchy
      //}
      //var resizeTimeout;
      //$(window).on('resize', function() {
      //  clearTimeout(resizeTimeout);
      //  resizeTimeout = setTimeout(function() {
      //    fitIn();
      //  }, 500);
      //});

      return terminals[element_id];
    }

    function exec(id, command) {
      terminals[id].backend.write(command + '\r');
    }
  }

})();