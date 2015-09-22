(function() { 
 
angular
  .module('dw')
  .factory('$drude', $drude);
 
function $drude () {
  return {
    validateProject: validateProject
  };

  function validateProject(newPath, callback) {
    // check that newPath readable/exists
    fs.access(newPath, fs.R_OK, function(err) {
      if (err) { callback({ msg: 'Can not read from ' + newPath }); return; }
      // check that newPath/docker-compose.yml readable/exists
      fs.access(newPath + '/docker-compose.yml', fs.R_OK, function(err) {
        if (err) { callback({ msg: 'Can not read ' + newPath + '/docker-compose.yml' }); return; }
        // looks legit. return
        var basename = path.basename(newPath);
        callback(null, {
          name: basename,
          path: basename,
          containers: {}
        });
      });
    });
  }
}
 
})();