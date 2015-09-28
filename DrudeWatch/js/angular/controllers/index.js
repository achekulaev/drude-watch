(function() {

angular
  .module('dw')
  .controller('IndexController', IndexController);

function IndexController($scope, $interval, $localStorage, $sessionStorage, $vbox, $vagrant, $docker, $yaml, $drude, $messages, $tray, $terminal) {
  var ctrl = this;
  ctrl.projectChooser = document.querySelector('#fileDialog');
  ctrl.initConfig = initConfig;
  initConfig();
  initChooser();
  initTerminal();
  drudeWatch();
  $tray.getMenu();
  $interval(drudeWatch, 1000);

  //------------------

  this.addProject = function() { // see initChooser
    ctrl.projectChooser.click();
    $messages.clear();
  };

  this.tabActivate = function(id) {
    // id == project.label
    var tabContent = jQuery('#tabContent');
    if (tabContent.find('div#'+id+'.active').length) { return; } // if tab already active
    tabContent.find('div[role=tabpanel]').removeClass('active');
    tabContent.find('div#'+id).addClass('active').find('div.terminal').focus();
    jQuery('li[data-label]').removeClass('active');
    jQuery('li[data-label="' + id + '"]').addClass('active');
  };

  this.command = function(projectLabel, command) {
    ctrl.terminals[projectLabel].exec(command);
  };

  this.startProject = function(project) {
    project.status = 10;
    this.command(project.label, 'dsh up');
  };

  this.stopProject = function(project) {
    project.status = 10;
    this.command(project.label, 'dsh stop');
  };

  this.startExclusively = function(project) {
    this.command(project.label, 'dsh stop --all && dsh up');
  };

  this.showConsole = function() {
    win.showDevTools();
  };

  this.resetSettings = function() {
    $localStorage.$reset();
    ctrl.initConfig();
  };

  this.aboutApp = function() {
    //<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a>             is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a></div>
  }

  function initConfig() { // Uses ngStorage (https://github.com/gsklee/ngStorage)
    //$localStorage.$reset();
    // Persistent config
    ctrl.config = $localStorage.$default({
      vagrant: {
        //path: '/Users/alexei.chekulaev/Sites'
        path: ''
      },
      docker: {
        host: 'http://127.0.0.1',
        port: 2375,
        timeout: 1000 //ms
        //socket: '/var/run/docker.sock'
      },
      projects: {
        //wholefoods: {
        //  name: 'wholefoods',
        //  path: 'wholefoods',
        //  containers: {}
        //}
      }
    });

    // Session config
    ctrl.session = $sessionStorage.$default({
      vagrant: {
        vm : { id: '', name: 'Loading...', running: false },
        error: ''
      },
      docker: { error: '' },
      terminals: {}
    });
    ctrl.terminals = {};
  }

  function initTerminal(projectLabel) { //TODO need to init terminals for added projects
    var tabContent = jQuery('#tabContent'),
        terminalHTML = '<div role="tabpanel" class="tab-pane" id="{0}"><div id="{0}-terminal"></div></div>',
        cols = Math.floor((tabContent.width()/7.8)), //for 13px font
        rows = Math.floor((tabContent.height()/18));

    angular.forEach(ctrl.config.projects, function(project) {
      if (!isEmpty(projectLabel) && project.label != projectLabel) return;
      // Create div holders for terminals
      var tab_id = project.label;
      if (!jQuery(tab_id).length) {
        jQuery(terminalHTML.format(tab_id)).appendTo(tabContent);
      }

      //Create terminals
      if (!isEmpty(ctrl.terminals[project.name])) {
        console.warn('Terminal for ' + project.name + ' already exists');
        return;
      }

      var startupCommand = 'cd '+ ctrl.config.vagrant.path + '/' + project.path;
      ctrl.terminals[project.label] = $terminal.get(tab_id+'-terminal', cols, rows, startupCommand);
    });
  }

  function drudeWatch() {
    if (!ctrl.config.vagrant.path) return;

    $vagrant.getVboxId(ctrl.config.vagrant.path, function (err, id) {
      var vagrant = ctrl.session.vagrant;
      vagrant.error = '';
      vagrant.errorData = '';
      if (err) {
        vagrant.error = 'Could not get Vagrant VM id.';
        vagrant.errorData = err;
      }

      $vbox.info(id, function(err, machine) {
        if (err) {
          vagrant.error = 'Could not get info for Vbox: ' + id;
          vagrant.errorData = err;
        }
        vagrant.vm = machine;
        $scope.$apply();
      });
    });

    $docker.listContainers(ctrl.config.docker, function (err, containers) {
      if (err) {
        ctrl.session.docker.error = 'Could not connect to Docker with these parameters: ';
        var params = '';
        if (ctrl.config.docker.socket) {
          params = ctrl.config.docker.socket;
        } else {
          params = ctrl.config.docker.host + ':' + ctrl.config.docker.port;
        }
        ctrl.session.docker.error += params;
        $scope.$apply();
      }

      // containers is an array:  [ 0: {}, 1: {} .... ]
      // parseYml returns Object: { cli: {}, web: {}, db: {} }
      var config = ctrl.config;
      angular.forEach(ctrl.config.projects, function(p) {
        var p_containers = $yaml.parseYml('{0}/{1}/docker-compose.yml'.format(config.vagrant.path, p.path));
        if (!isEmpty(containers)) {
          p.containers = matchContainers(p.label, p_containers, containers);
        } else {
          p.containers = p_containers;
        }
        var hasRunning = 0,
            hasStopped = 0;
        angular.forEach(p.containers, function(container){
          if (container.$instance) hasRunning = 1;
          if (!container.$instance) hasStopped = 2;
        });
        p.status = hasRunning + hasStopped;
      });

      if (!isEmpty(containers)) {
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
      $drude.validateProject(ctrl.config.vagrant.path, this.value,
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
          newProject[project.label] = project;
          angular.merge(ctrl.config.projects, newProject);
          initTerminal(project.label);
          console.log(ctrl.config.projects);
        }
      );

    }, false);
  }

  this.debug = function() {
    console.log(ctrl.config);
    ctrl.showConsole();
  };

  this.killForegroundProcess = function(projectLabel) {
    var $pid = ctrl.terminals[projectLabel].backend.pid;

    var pgrep = 'pgrep -P {0}';
    exec(pgrep.format($pid), function(err, stdout, stderr) {
      stdout = stdout.replace(/[^\d\|\\]/, '');
      if (!isEmpty(stdout)) {
        // explain: kills process that matches formatted for grep results from pgrep, excludes grep, foreground only (S+)
        var kill = 'kill -9 $(ps x | grep -e "$(pgrep -P {0} | xargs | sed "s/ /\\\\|/")" | grep -v grep | grep S+ | cut -d " " -f 1)';
        exec(kill.format($pid));
      }
    });
  };

  $scope.$on('tabActivate', function(e, tabId) {
    ctrl.tabActivate(tabId);
  });

}

})();