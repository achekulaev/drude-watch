(function() { 
 
angular
  .module('dw')
  .factory('$messages', $messages);
 
function $messages ($rootScope) {
  return {
    info: info,
    warning: warning,
    error: error
  };

  function info(text) {
    broadcast('info', text);
  }

  function warning(text) {
    broadcast('warning', text);
  }

  function error(text) {
    broadcast('danger', text);
  }

  function broadcast(type, text) {
    $rootScope.$broadcast('app.message', type, text);
  }
}
 
})();