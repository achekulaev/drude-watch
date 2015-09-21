(function() {

angular
  .module('dw')
  .controller('IndexController', IndexController);

function IndexController($scope, $vbox, $docker) {
  $scope.$vbox = $vbox;
  $scope.$docker = $docker;
  $scope.$storage = {
    projects: {
      id: 1,
      path: '/Users/alexei.chekulaev/Sites/wholefoods',
      containers: {

      }
    }
  };

  $scope.$vbox.getList();
  $scope.$docker.listContainers();

  /**
   * React on services updates that happen in anonymous functions
   */
  $scope.$on('scopeApply', function (e, service) {
    if (['$docker', '$vbox'].indexOf(service) != -1) {
      $scope.$apply();
    }
  });

}

})();