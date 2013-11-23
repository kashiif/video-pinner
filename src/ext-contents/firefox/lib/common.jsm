'use strict';
var EXPORTED_SYMBOLS = ['logger', 'unloadCommonJsm'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

// @ifdef PrefManager
Cu.import('resource://video-pinner/ext-contents/firefox/lib/prefmanager.jsm');

PrefManager.init('extensions.videopinner.', 'resource://video-pinner/ext-contents/defaults/preferences/defaults.js');

var _prefManager = PrefManager;
// @endif

var unloadCommonJsm = function() {
  // @ifdef PrefManager
  Cu.unload('resource://video-pinner/ext-contents/firefox/lib/prefmanager.jsm');  
  // @endif
};

var gConsoleService = null;

var logger = {
  _prefix: "",
  init: function(prefix) {
    gConsoleService = Cc['@mozilla.org/consoleservice;1'].
                          getService(Ci.nsIConsoleService);
    this._prefix = (prefix? prefix + ": " : "");
  },

  log: function(msg) {
    if (!gConsoleService) return;
    gConsoleService.logStringMessage(this._prefix + this._getMessage.apply(this, Array.prototype.slice.call(arguments, 0)));
  },
  
  debug: function(msg) {
    if (!gConsoleService) return;
    gConsoleService.logStringMessage(this._prefix + this._getMessage.apply(this, Array.prototype.slice.call(arguments, 0)));
  },
  
  _getMessage: function() {
    var msg = "", argN;
    
    if (arguments.length == 1) {
      argN = arguments[0];
      
      if (argN instanceof String) {
        return argN;
      }
      if (typeof argN == "object") {
        return utils.stringify(argN, true);
      }
      
      return argN;      
    }
    
    for (var i=0 ; i<arguments.length ; i++) {
      argN = arguments[i];
      if (typeof argN == "object") {
        msg += utils.stringify(argN);
      }
      else {
        msg += argN;
      }
    }
    
    return msg;
    
  },

  error: function(msg) {
    Cu.reportError(msg);
  },
  
  destroy: function(){
    gConsoleService = null;
  }


};


