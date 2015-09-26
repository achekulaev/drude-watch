(function () {

  angular
    .module('dw')
    .controller('VagrantController', VagrantController);

  function VagrantController($scope, $q, $messages) {
    var ctrl = this;
    ctrl.pathChooser = document.getElementById('vagrantPathChooser');
    ctrl.error = '';
    initChooser();

    function initChooser() {
      var chooser = ctrl.pathChooser;
      chooser.addEventListener('change', function(e) {
        if (this.value == '') return;
        var path = this.value;
        if (pathsReadableSync(path) && pathsReadableSync(path + '/Vagrantfile')) {
          $scope.$parent.$parent.app.config.vagrant.path = path;
        }
      }, false);
    }

    function pathsReadableSync(path) {
      try {
        fs.accessSync(path, fs.R_OK);
        return true;
      } catch (e) {
        ctrl.error = 'Could not find or read path: ' + path;
        return false;
      }
    }
  }

})();