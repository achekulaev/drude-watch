(function() {

angular
  .module('dw')
  .factory('$docker', $docker);

function $docker($rootScope) {
  var $instance = {
    containers: [],
    refresh: listContainers
  };
  listContainers();
  return $instance;

  ////////////

  function listContainers() {
    var docker = new DockerClient({host: 'http://127.0.0.1', port: 2375, timeout: 1000});
    docker.listContainers(function (err, containers) {
      $instance.containers = containers;
      $rootScope.$broadcast('scopeApply', '$docker');
    });
  }
}

})();