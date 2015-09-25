(function() {

angular
  .module('dw')
  .controller('IndexController', IndexController);

function IndexController($scope, $interval, $localStorage, $sessionStorage, $vbox, $vagrant, $docker, $yaml, $drude, $messages, $tray, $terminal) {
  var ctrl = this;
  ctrl.projectChooser = document.querySelector('#fileDialog');
  initConfig();
  initChooser();
  initTerminal();
  drudeWatch();
  $tray.getMenu();
  $interval(drudeWatch, 1000);

  //------------------

  this.addProject = function() {
    ctrl.projectChooser.click();
  };

  this.tabActivate = function(id) {
    // id == project.path
    var tabContent = jQuery('#tabContent');
    tabContent.find('div[role=tabpanel]').removeClass('active');
    tabContent.find('div#'+id+'-terminal').addClass('active').find('div.terminal').focus();
    jQuery('li[data-label]').removeClass('active');
    jQuery('li[data-label="' + id + '"]').addClass('active');
  };

  this.command = function(projectLabel, command) {
    ctrl.terminals[projectLabel].exec(command);
  };

  this.startProject = function(projectLabel) {
    this.command(projectLabel, 'dsh up');
  };

  this.stopProject = function(projectLabel) {
    this.command(projectLabel, 'dsh down');
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
    console.log(ctrl.config);
    // Session config
    ctrl.session = $sessionStorage.$default({
      vagrant: {
        vm : { id: '', name: 'Loading...', running: false }
      },
      terminals: {}
    });
    ctrl.terminals = {};
  }

  function initTerminal() { //TODO need to init terminals for added projects
    var tabContent = document.querySelector('#tabContent'),
        terminalHTML = '<div role="tabpanel" class="tab-pane" id="{0}"></div>',
        cols = 140,
        rows = 35;

    angular.forEach(ctrl.config.projects, function(project) {
      // Create div holders for terminals
      var terminal_id = project.label + '-terminal';
      if (!jQuery(terminal_id).length) {
        jQuery(terminalHTML.format(terminal_id)).appendTo(tabContent);
      }

      //Create terminals
      if (!isEmpty(ctrl.terminals[project.name])) {
        console.warn('Terminal for ' + project.name + ' already exists');
        return;
      }

      var startupCommand = 'cd '+ ctrl.config.vagrant.path + '/' + project.path;
      ctrl.terminals[project.label] = $terminal.get(terminal_id, cols, rows, startupCommand);
    });
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
        p.label = p.path.replace(/[^\w]/, ''); //TODO refactor this!!
        var p_containers = $yaml.parseYml('{0}/{1}/docker-compose.yml'.format(config.vagrant.path, p.path));
        p.containers = matchContainers(p.path, p_containers, containers);
      });

      if (containers.length !== 0) {
        //TODO; iterate through leftover containers. Make fake wrappers to display them under 'Unknown' INTO SESSION!!
        //angular.merge(ctrl.config.projects, {
        //  name: 'Unknown project',
        //    path: 'unknown',
        //    containers: containers
        //});
      }
      $tray.getMenu(config.projects);
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

  $scope.$on('tabActivate', function(e, tabId) {
    ctrl.tabActivate(tabId);
  });

}

})();