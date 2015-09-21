Controllers.factory('$docker', function($rootScope) {
  var $instance = { containers: [] };

  $instance.listContainers = function() {
    var docker = new DockerClient({host: 'http://127.0.0.1', port: 2375, timeout: 1000});
    docker.listContainers(function (err, containers) {
      $instance.containers = containers;
      $rootScope.$broadcast('scopeApply', '$docker');
    });
  };

  return $instance;
});