var gui = require('nw.gui')
  , fs = require('fs')
  , win = gui.Window.get(); //open file with default app

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
 * Check for empty value
 * @param value
 * @returns {boolean|*}
 */
function isEmpty(value){
  var isEmptyObject;
  if (typeof jQuery == 'undefined') {
    isEmptyObject = function(obj) { return Object.keys(obj).length == 0; }
  } else {
    isEmptyObject = jQuery.isEmptyObject;
  }
  return (typeof value === 'undefined' || value == null || value === 0 || value.length === 0 || isEmptyObject(value));
}