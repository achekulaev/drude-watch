(function() { 
 
angular
  .module('dw')
  .factory('$vagrant', $vagrant);
 
function $vagrant(vname) {
  return {
    getVboxId: getVboxId
  };
  /**
   * Gets Drude VM id with path to Vagrantfile provided
   * @param vagrant_path to Vagrantfile
   * @param callback
   */
  function getVboxId(vagrant_path, callback) {
    var vmid_file = vagrant_path + '/' + '.vagrant/machines/' + vname + '/virtualbox/id';
    fs.readFile(vmid_file, function (err, data) {
      if (err) {
        callback(err);
      } else {
        callback(null, String(data));
      }
    });
  }
}
 
})();