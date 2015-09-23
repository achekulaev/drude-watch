(function () {

  angular
  .module('dw')
  .factory('$tray', $tray);

function $tray() {
  var tray = new gui.Tray({ icon: 'img/icon.png' });
  var menu = new gui.Menu();
      menu.clear = clear;
      menu.compile = compile;
  var trayMenu = [];
  var projectsList = [];

  return {
    getMenu: getMenu
  };


  function getMenu(projects) {
    var menuHeader =
      [{
        label: 'Drude Watch',
        click: function() { win.show(); win.focus(); }
      }, {
        type: 'separator'
      }];

    var menuFooter = [{
        label: 'Quit',
        click: function() { gui.App.quit(); }
    }];

    var projectsMenu = getProjectsMenu(projects);

    if (!projectsMenu.list.equals(projectsList)) {
      console.log('rebuilding menu');
      projectsList = projectsMenu.list;
      menu.clear(); //TODO refactor to delete only projects
      menu.compile(menuHeader.concat(projectsMenu.menu, menuFooter));
      tray.menu = menu;
    }
  }

  /**
   * Build new project menu
   * @param projects
   * @returns {{list: Array, menu: Array}} list to compare with old one as we can't compare objects
   */
  function getProjectsMenu(projects) {
    var list = [], menu = [];
    angular.forEach(projects, function(project) {
      list.push([project.name]);
      menu.push({
        label: project.name,
        click: function() {}
      });
      angular.forEach(project.containers, function(container, name) {
        list[list.length - 1].push(name);
        menu.push({
          label: "- " + name,
          click: function() {}
        });
      });
      menu.push({ type: 'separator' });
    });

    return { list: list, menu: menu };
  }

  /**
   * Clear menu
   */
  function clear() {
    while (this.items.length > 0) {
      this.removeAt(0);
    }
  }

  /**
   * Build menu from template
   * @param template
   */
  function compile(template) {
    for (var i = 0; i < template.length; i++) {
      var item = template[i];
      if (item.type == 'separator') {
        this.append(new gui.MenuItem({ type: 'separator' }));
      } else {
        this.append(new gui.MenuItem({
          label: item.label,
          click: item.click
        }));
      }
    }
  }
}

})();