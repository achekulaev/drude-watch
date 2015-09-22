(function() { 
 
angular
  .module('dw')
  .controller('MessagesController', MessagesController);
 
function MessagesController ($scope) {
  var ctrl = this;
  ctrl.list = [{ type: 'error', text: 'Failed' }];

  $scope.add = function(type, text) {
    ctrl.list.push({ type: type, text: text });
  };

  $scope.error = function(text) {
    $scope.add('error', text);
  };

  $scope.release = function(index) {
    ctrl.list.splice(index, 1);
  }
} 

})();