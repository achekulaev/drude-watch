Controllers.factory('$vbox', function() {
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
        list.push({
          id: id,
          name: machine.name,
          running: machine.running
        });
      });
      $instance.list = list;
      //console.log($instance.list);
      callback();
    });
  };

  return $instance;

});