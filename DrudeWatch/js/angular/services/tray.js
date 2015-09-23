(function () {

// attach the .equals method to Array's prototype to call it on any array
  Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
      return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
      return false;

    for (var i = 0, l=this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i]))
          return false;
      }
      else if (this[i] != array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  };

  angular
  .module('dw')
  .factory('$tray', $tray);


function $tray() {
  var tray = new gui.Tray({ icon: 'img/icon.png' });
  var menu = new gui.Menu();
  var trayMenu = [];
  var projectsList = [];

  return {
    getMenu: getMenu
  };


  function getMenu(projects) {
    var menuHeader = [
      {
        label: 'Drude Watch',
        click: function() { win.show(); win.focus(); }
      },
      { type: 'separator' }
    ];
    var menuFooter = [
      {
        label: 'Quit',
        click: function() { gui.App.quit(); }
      }
    ];
    var menuProjects = [];
    var newProjectsList = [];
    angular.forEach(projects, function(project) {
      newProjectsList.push([project.name]);
      menuProjects.push({
        label: project.name,
        click: function() {}
      });
      angular.forEach(project.containers, function(container, name) {
        newProjectsList[newProjectsList.length-1].push(name);
        menuProjects.push({
          label: "- " + name,
          click: function() {}
        });
      });
      menuProjects.push({ type: 'separator' });
    });
    //console.log(newProjectsList);

    if (!newProjectsList.equals(projectsList)) {
      console.log('rebuilding menu');
      while (menu.items.length > 0) {
        menu.removeAt(0);
      }
      projectsList = newProjectsList;
      trayMenu = menuHeader.concat(menuProjects, menuFooter);
    } else {
      return;
    }

    for (var i = 0; i < trayMenu.length; i++) {
      var item = trayMenu[i];
      if (item.type == 'separator') {
        menu.append(new gui.MenuItem({ type: 'separator' }));
      } else {
        menu.append(new gui.MenuItem({
          label: item.label,
          click: item.click
        }));
      }
    }

    tray.menu = menu;
  }
}

})();