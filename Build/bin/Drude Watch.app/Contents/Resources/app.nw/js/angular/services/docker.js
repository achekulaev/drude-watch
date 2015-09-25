(function() {

angular
  .module('dw')
  .factory('$docker', $docker);

function $docker() {
  return {
    listContainers: listContainers
  };

  ////////////

  function listContainers(config, callback) {
    var docker = new DockerClient(config);
    docker.listContainers(function (err, containers) {
      callback(err, containers);
    });
  }
}

})();