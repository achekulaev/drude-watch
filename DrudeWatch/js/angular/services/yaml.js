(function () {

angular
  .module('dw')
  .factory('$yaml', $yaml);

function $yaml() {
  return {
    parseYml: parseYml
  };

  /////////

  /**
   * Parse yaml into Object
   * @param file
   */
  function parseYml(file) {
    try {
      return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      console.log(e);
      return {}
    }
  }
}

})();