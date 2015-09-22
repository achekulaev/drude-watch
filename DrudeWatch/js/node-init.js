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
  , yaml = require('js-yaml');

var mb = new gui.Menu({ type : "menubar" });

//-- Initiate default Mac OS menu
mb.createMacBuiltin("AppName");
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

/**
 * Check is value is empty. Deep-checks arrays but not objects (See note!)
 * Note: isEmpty([]) == true, isEmpty({}) == true, isEmpty([{},"",0]) == true, isEmpty({0:""}) == false
 * @param value
 * @returns {boolean}
 */
function isEmpty(value){
  var isEmptyObject = function(a) {
    if (typeof a.length === 'undefined') { // it's an empty/non-empty Object. Not an Array
      return Object.keys(a).length === 0;
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
