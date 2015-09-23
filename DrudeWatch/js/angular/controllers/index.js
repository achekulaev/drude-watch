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
  drudeWatch();
  $interval(drudeWatch, 10000);

  //------------------

  this.addProject = function() {
    ctrl.projectChooser.click();
  };

  function initConfig() { // Uses ngStorage (https://github.com/gsklee/ngStorage)
    //$localStorage.$reset();
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
      },
      terminals: {}
    });
  }

  function initTerminal() {
    var tabContent = document.querySelector('#tabContent'),
        terminalHTML = '<div role="tabpanel" class="tab-pane" id="{0}">{1}</div>',
        cols = 115,
        rows = 43;

    angular.forEach(ctrl.config.projects, function(project) {
      // Create div holders for terminals
      var project_label = project.name.replace(/[^\w]/, ''),
          terminal_id = '{0}-terminal'.format(project_label);
      if (!document.querySelector('#' + terminal_id)) {
        jQuery(terminalHTML.format(terminal_id, project.name))
          .appendTo(tabContent);
      }

      //Create terminals
      if (!isEmpty(ctrl.session.terminals[project.name])) {
        console.warn('Terminal for '+project.name+' already exists');
      }
      ctrl.session.terminals[project.name] = {};
      var terminal = ctrl.session.terminals[project.name];
      terminal.readonly = false;
      console.log(ctrl.session.terminals);
      //terminal.backend = pty.spawn('bash', [], {
      //  name: 'xterm',
      //  cols: cols,
      //  rows: rows,
      //  cwd: process.env.HOME,
      //  env: process.env
      //});
      //terminal.frontend = new termjs.Terminal({
      //  useStyle: true,
      //  visualBell: true,
      //  geometry: [cols, rows]
      //});
      //var frontend = terminal.frontend;
      //var backend = terminal.backend;
      //frontend.on('data', function(data) {
      //  if (readonly) return;
      //  backend.write(data);
      //});
      //
      //backend.on('data', function(data) {
      //  frontend.write(data);
      //});

      //initiate frontend
      //frontend.open('#'+terminal_id);
      //setTimeout(backend.write('cd '+
      //  ctrl.config.vagrant.path+'/'+
      //  project.path+'\r'), 1000);
    });

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
    //setTimeout(term.write('cd '+
    //  ctrl.config.vagrant.path+'/'+
    //  ctrl.config.projects.wholefoods.path+'\r'), 1000);
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
    function matchContainers(project_path, yml_entries, containers) {
      //console.log(yml_entries);
      //console.log(containers);
      angular.forEach(yml_entries, function (entry, service_name) {
        delete entry.$instance;
        var entry_label = project_path.replace(/[^\w]/, '') + '_' + service_name; //TODO: account for several same-named entries
        angular.forEach(containers, function(container, index) {
          var labels = container.Labels;
          var container_label = labels['com.docker.compose.project'] + '_' + labels['com.docker.compose.service'];
          //console.log(container_label, entry_label);
          if (container_label == entry_label) {
            entry.$instance = container; // assign matched container as instance or service
            containers.splice(index, 1); // remove matched container from list
          }
        });
      });

      return yml_entries;
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