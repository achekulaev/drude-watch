(function() {

angular
  .module('dw')
  .controller('IndexController', IndexController);

function IndexController($scope, $vbox, $docker) {
  var ctrl = this;
  ctrl.vbox = $vbox;
  ctrl.docker = $docker;
  ctrl.storage = {
    projects: {
      id: 1,
      path: '/Users/alexei.chekulaev/Sites/wholefoods',
      containers: {

      }
    }
  };

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