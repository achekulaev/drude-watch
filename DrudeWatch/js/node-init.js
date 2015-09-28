var gui = require('nw.gui')
  , fs = require('fs')
  , path = require('path')
  , win = gui.Window.get()
  , pty = require('pty.js')
  , termjs = require('term.js')
  , io = require('socket.io')
  , express = require('express')
  , virtualbox = require('virtualbox') // https://github.com/Node-Virtualization/node-virtualbox
  , DockerClient = require('dockerode') // https://github.com/apocas/dockerode
  , yaml = require('js-yaml')
  , exec = require('child_process').exec;

var mb = new gui.Menu({ type : "menubar" });

//-- Initiate default Mac OS menu
mb.createMacBuiltin("Drude Watch");
win.menu = mb;
win.focus();

//-- Prevent Exception that would make app unusable
process.on("uncaughtException", function(err) {
  console.log("[!] Exception -- " + err.stack + "\n--------------------\n");
});

//-- Prevent loading external page that would make app unusable
window.onbeforeunload = function() {
  win.hide();
  gui.App.quit();
};

/**
 * package.json starts window invisible for smoother load. here we show it
 */
$(window).on('load', function() {
  win.show();
  win.focus();
});

win.hideToTray = function() {
  this.hide();
  this.setShowInTaskbar(false);
};

win.restoreFromTray = function() {
  this.show();
  this.focus();
  this.setShowInTaskbar(true);
};

/** Handle Cmd-Q as quit and Close button as hide **/
win.on('close', function(event) {
  if (event == 'quit') { //Cmd-q pressed
    gui.App.quit();
  } else {
    this.hideToTray();
  }
});

window.onkeypress = function KeyPress(e) {
 if (e.keyCode == 94 && e.metaKey && e.altKey) { // Cmd-Alt-i
   win.showDevTools();
 }
};

/**
 * Checks if value is empty. Deep-checks arrays and objects
 * Note: isEmpty([]) == true, isEmpty({}) == true, isEmpty([{0:false},"",0]) == true, isEmpty({0:1}) == false
 * @param value
 * @returns {boolean}
 */
function isEmpty(value){
  var isEmptyObject = function(a) {
    if (typeof a.length === 'undefined') { // it's an Object, not an Array
      var hasNonempty = Object.keys(a).some(function nonEmpty(element){
        return !isEmpty(a[element]);
      });
      return hasNonempty ? false : isEmptyObject(Object.keys(a));
    }

    return !a.some(function nonEmpty(element) { // check if array is really not empty as JS thinks
      return !isEmpty(element); // at least one element should be non-empty
    });
  };
  return (
    value == false
    || typeof value === 'undefined'
    || value == null
    || (typeof value === 'object' && isEmptyObject(value))
  );
}
