(function() { 
 
angular
  .module('dw')
  .controller('MessagesController', MessagesController);
 
function MessagesController ($scope) {
  var ctrl = this;
  ctrl.list = [];

  ctrl.add = function(type, text) {
    ctrl.list.push({ type: type, text: text });
  };

  ctrl.release = function(index) {
    ctrl.list.splice(index, 1);
  };

  ctrl.releaseAll = function() {
    ctrl.list = [];
  };

  $scope.$on('app.message', function(e, type, text) {
    ctrl.add(type, text);
  });

  $scope.$on('app.message.clear', function(e) {
    ctrl.releaseAll();
  });
} 

})();