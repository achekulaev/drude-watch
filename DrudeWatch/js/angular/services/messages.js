(function() { 
 
angular
  .module('dw')
  .factory('$messages', $messages);
 
function $messages ($rootScope) {
  return {
    info: info,
    warning: warning,
    error: error,
    clear: clear
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

  function clear() {
    $rootScope.$broadcast('app.message.clear');
  }

  function broadcast(type, text) {
    $rootScope.$broadcast('app.message', type, text);
  }
}
 
})();