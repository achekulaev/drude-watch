(function() {

angular
  .module('dw')
  .factory('$vbox', $vbox);

function $vbox($rootScope) {
  var $instance = {
    list: [{ name: 'Loading...', running: true }],
    refresh: getList
  };
  getList();
  return $instance;

  /////////

  /**
   * Gets array of VMs:
   *   [ { id: int, name: string, running: bool }, ... ]
   */
  function getList() {
    virtualbox.list(function list_callback(machines, error) {
      if (error) {
        //TODO: handle it
        return;
      }

      var list = [];
      angular.forEach(machines, function(machine) {
        if (machine.name.toString().match(/boot2docker/)) {
          list.push({
            id: machine.id,
            name: machine.name,
            running: machine.running
          });
        }
      });

      $instance.list = list;
      $rootScope.$broadcast('scopeApply', '$vbox');
    });
  }

}

})();