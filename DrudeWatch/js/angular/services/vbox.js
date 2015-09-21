(function() {

angular
  .module('dw')
  .factory('$vbox', $vbox);

function $vbox($rootScope) {
  var $instance = { list: [{ name: 'Loading...', running: true }] };

  /**
   * Returns array of VMs:
   *   [ { id: int, name: string, running: bool }, ... ]
   * @param callback receives list as first parameter
   */
  $instance.getList = function(callback) {
    virtualbox.list(function list_callback(machines, error) {
      if (error) {
        return;
      }
      var list = [];
      Object.keys(machines).forEach(function(id) {
        var machine = machines[id];
        if (machine.name.toString().match(/boot2docker/)) {
          list.push({
            id: id,
            name: machine.name,
            running: machine.running
          });
        }
      });
      $instance.list = list;

      $rootScope.$broadcast('scopeApply', '$vbox');
    });
  };

  return $instance;

}

})();