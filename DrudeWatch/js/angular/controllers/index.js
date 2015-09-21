Controllers.controller('index', ['$scope', '$vbox', '$docker',
function($scope, $vbox, $docker) {
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

  $scope.$on('scopeApply', function (e, service) {
    if (['$docker', '$vbox'].indexOf(service) != -1) {
      $scope.$apply();
    }
  });

}]);