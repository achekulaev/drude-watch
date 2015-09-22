(function() { 
 
angular
  .module('dw')
  .factory('$drude', $drude);
 
function $drude () {
  return {
    newProject: newProject
  };

  function newProject(newPath, callback) {
    fs.access(newPath, fs.R_OK, function(err) {
      if (err) { callback({ msg: 'Can not read from ' + newPath }); return; }
      fs.access(newPath + '/docker-compose.yml', fs.R_OK, function(err) {
        if (err) { callback({ msg: 'Can not read ' + newPath + '/docker-compose.yml' }); return; }
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