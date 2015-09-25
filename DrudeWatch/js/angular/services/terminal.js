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
      frontend.on('data', function(data) {
        if (terminal.readonly) return;
        backend.write(data);
      });

      backend.on('data', function(data) {
        frontend.write(data);
      });
      // bind exec to id
      terminals[element_id].exec = function(command) {
        exec(element_id, command);
      };

      //initiate frontend
      frontend.open(document.getElementById(element_id));
      setTimeout(backend.write(startupCommand + '\r'), 1000);
      return terminals[element_id];
    }

    function exec(id, command) {
      terminals[id].backend.write(command + '\r');
    }
  }

})();