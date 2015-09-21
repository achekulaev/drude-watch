(function() {

angular
  .module('dw')
  .controller('IndexController', IndexController);

function IndexController($scope, $vbox, $docker, $yaml, $localStorage) {
  var ctrl = this;
  ctrl.vbox = $vbox;
  initConfig();
  getStatus();

  ////////////

  function initConfig() {
    $localStorage.$reset();
    // For docs see: https://github.com/gsklee/ngStorage
    // Initialize with default values if empty
    ctrl.config = $localStorage.$default({
      docker: {
        host: 'http://127.0.0.1',
        port: 2375,
        timeout: 1000
        //socketPath: '/var/run/docker.sock'
      },
      projects: {
        1: {
          name: 'wholefoods',
          label: 'wholefoods',
          path: '/Users/alexei.chekulaev/Sites/wholefoods',
          containers: {}
        }
      }
    });
  }

  function getStatus() {
    $docker.listContainers(ctrl.config.docker, function (err, containers) {
      if (err) {
        console.log('Could not connect to Docker with: ');
        console.log(ctrl.config.docker);
        return;
      }

      // containers is an array:  [ 0: {}, 1: {} .... ]
      // parseYml returns Object: { cli: {}, web: {}, db: {} }
      var project = ctrl.config.projects[1];
      project.containers = $yaml.parseYml(ctrl.config.projects[1].path + '/docker-compose.yml');
      project.containers = matchContainers(ctrl.config.projects[1].label, project.containers, containers);

      if (containers.length !== 0) {
        //TODO; iterate through containers. Make fake wrappers to display them
        //angular.merge(ctrl.config.projects, {
        //  name: 'Unknown project',
        //    label: 'unknown',
        //    path: '',
        //    containers: containers
        //});
      }
    });

    /**
     * Each config entry will turn into container with label that equals:
     *   project_name + '_' + service_name + '_' + #number
     * This function find matches between config entries and running containers
     */
    function matchContainers(project_label, config_entries, containers) {
      angular.forEach(config_entries, function (entry, service_name) {
        var entry_label = project_label + '_' + service_name; //TODO: account for several same-named entries
        angular.forEach(containers, function(container, index) {
          var labels = container.Labels;
          var container_label = labels['com.docker.compose.project'] + '_' + labels['com.docker.compose.service'];
          if (container_label == entry_label) {
            entry.$instance = container;
            containers.splice(index, 1);
          }
        });
      });

      return config_entries;
    }

    /**
     * Makes labels for containers created by old docker-compose
     * @param containers
     */
    function labelContainers(containers) {
      ////
    }
  }

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