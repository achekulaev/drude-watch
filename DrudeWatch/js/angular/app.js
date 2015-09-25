angular
  .module('dw', ['ngRoute', 'ngStorage'])
  .value('vname', 'boot2docker') // see config.vm.define in Vagrantfile
  .run(function($rootScope) {
    $('[data-toggle="tooltip"]').tooltip();
    $rootScope.$on('win.show', function() {
      win.show();
      win.focus();
    });
  });