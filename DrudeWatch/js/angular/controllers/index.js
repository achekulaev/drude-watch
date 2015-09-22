(function() {

angular
  .module('dw')
  .controller('IndexController', IndexController);

function IndexController($scope, $interval, $localStorage, $sessionStorage, $vbox, $vagrant, $docker, $yaml, $drude, $messages) {
  var ctrl = this;
  ctrl.projectChooser = document.querySelector('#fileDialog');
  initConfig();
  initChooser();
  initTerminal();
  $interval(drudeWatch, 1000);

  //------------------

  this.addProject = function() {
    ctrl.projectChooser.click();
  };

  function initConfig() { // Uses ngStorage (https://github.com/gsklee/ngStorage)
    $localStorage.$reset();
    // Persistent config
    ctrl.config = $localStorage.$default({
      vagrant: {
        path: '/Users/alexei.chekulaev/Sites'
      },
      docker: {
        host: 'http://127.0.0.1',
        port: 2375,
        timeout: 1000 //ms
        //socketPath: '/var/run/docker.sock'
      },
      projects: {
        wholefoods: {
          name: 'wholefoods',
          path: 'wholefoods',
          containers: {}
        }
      }
    });
    // Session config
    ctrl.session = $sessionStorage.$default({
      vagrant: {
        vm : { id: '', name: 'Loading...', running: false }
      }
    }
    );
  }

  function initTerminal() {
    var cols = 115,
        rows = 43;
    var terminal, term;
    var readonly = false;
    //backend
    term = pty.spawn('bash', [], {
      name: 'xterm',
      cols: cols,
      rows: rows,
      cwd: process.env.HOME,
      env: process.env
    });

    //frontend
    terminal = new termjs.Terminal({
      useStyle: true,
      visualBell: true,
      geometry: [cols, rows]
    });

    terminal.on('data', function(data) {
      if (readonly) return;
      term.write(data);
    });

    term.on('data', function(data) {
      terminal.write(data);
    });

    //initiate frontend
    terminal.open(document.getElementById('terminal'));
    setTimeout(term.write('cd '+
      ctrl.config.vagrant.path+'/'+
      ctrl.config.projects.wholefoods.path+'\r'), 1000);
  }

  function drudeWatch() {
    $vagrant.getVboxId(ctrl.config.vagrant.path, function (err, id) {
      if (err) {
        console.error('Could not get Vagrant VM id.');
        console.error(err);
      }

      $vbox.info(id, function(err, machine) {
        if (err) {
          console.error('Could not get info for Vbox: ' + id);
          console.log(err);
        }
        ctrl.session.vagrant.vm = machine;
        $scope.$apply();
      });
    });

    $docker.listContainers(ctrl.config.docker, function (err, containers) {
      if (err) {
        console.error('Could not connect to Docker with these parameters:');
        console.info(ctrl.config.docker);
        $scope.$apply();
        return;
      }

      // containers is an array:  [ 0: {}, 1: {} .... ]
      // parseYml returns Object: { cli: {}, web: {}, db: {} }
      var config = ctrl.config;
      angular.forEach(ctrl.config.projects, function(p) {
        var p_containers = $yaml.parseYml('{0}/{1}/docker-compose.yml'.format(config.vagrant.path, p.path));
        p.containers = matchContainers(p.path, p_containers, containers);
      });

      if (containers.length !== 0) {
        //TODO; iterate through containers. Make fake wrappers to display them under 'Unknown'
        //angular.merge(ctrl.config.projects, {
        //  name: 'Unknown project',
        //    path: 'unknown',
        //    containers: containers
        //});
      }
      $scope.$apply();
    });

    /**
     * Each config entry will turn into container with label that equals:
     *   project_dirname + '_' + service_name + '_' + #number
     * This function find matches between config entries and running containers
     */
    function matchContainers(project_label, config_entries, containers) {
      angular.forEach(config_entries, function (entry, service_name) {
        var entry_label = project_label + '_' + service_name; //TODO: account for several same-named entries
        angular.forEach(containers, function(container, index) {
          delete entry.$instance;
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
      //TODO assign labels to old containers that only have names
    }
  }

  function initChooser() {
    var chooser = ctrl.projectChooser;
    chooser.addEventListener('change', function(e) {
      if (this.value == '') return;
      $drude.validateProject(this.value,
        function createProject(err, project) {
          if (err) {
            $messages.error(err.msg);
            chooser.value = '';
            return;
          }

          var exists = false;
          angular.forEach(ctrl.config.projects, function (_project) {
            if (!exists && _project.path == project.path) {
              $messages.error('Project {0} already exists'.format(project.path));
              exists = true;
            }
          });
          if (exists) {
            chooser.value = '';
            return;
          }

          var newProject = {};
          newProject[project.path] = project;
          angular.merge(ctrl.config.projects, newProject);
          console.log(ctrl.config.projects);
        }
      );

    }, false);
  }

}

})();