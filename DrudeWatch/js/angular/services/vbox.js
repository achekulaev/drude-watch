(function() {

angular
  .module('dw')
  .factory('$vbox', $vbox);

function $vbox($rootScope) {
  return {
    list: list,
    info: info
  };

  /////////

  /**
   * Gets array of VMs:
   *   [ { id: int, name: string, running: bool }, ... ]
   */
  function list(callback) {
    virtualbox.list(function list_callback(machines, error) {
      if (error) {
        callback(error);
        return;
      }

      var list = [];
      angular.forEach(machines, function(machine, id) {
        list.push({
          id: id,
          name: machine.name,
          running: machine.running
        });
      });

      callback(null, list);
    });
  }

  /**
   * Get info for VM by id
   * @param id int
   * @param callback function
   */
  function info(id, callback) {
    list(function(err, machines) {
      if (err) {
        callback(err);
        return;
      }

      angular.forEach(machines, function(machine) {
        if (machine.id == id) {
          callback(null, machine);
        }
      });
    });
  }

}

})();