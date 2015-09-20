Controllers.controller('index', ['$scope', '$vbox',
function($scope, $vbox) {
  $scope.vms = [];

  $vbox.getList(function() {
    $scope.vms = $vbox.list;
    $scope.$apply();
  });
}]);