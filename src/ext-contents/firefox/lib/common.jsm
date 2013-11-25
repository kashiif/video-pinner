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


var utils = {

  _stringify: function(obj) {
    if (obj === null) {
      return "null";
    }
    if (typeof obj != "object") {
      return (obj ? obj.toString(): "undefined");
    }

    var items = [];
    for (var p in obj) {
      items.push(p + ": " + obj[p]);
    }
    return items;
  },

  /*******************************************************************************
  * Gets string equivalent of object. Roughly equivalent of JSON.stringify
  * 
  * @param {Object} obj An instance of object or null or undefined
  * @param {boolean} prettify true if new line characters should be inserted;
  *                  false otherwise
  *
  * @returns {String} String representation of provided object                  
  *******************************************************************************/
  stringify: function(obj, prettify) {
    var arr = utils._stringify(obj);
    
    if (arr instanceof Array) {
      if (prettify === true) {
        return "{\n  "  + arr.join(",\n  ") + "\n}";
      }
      return "{ "  + arr.join(", ") + " }";
    }
    
    return arr;  
  }
  
};

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
    try {
    gConsoleService.logStringMessage(this._prefix + this._getMessage.apply(this, Array.prototype.slice.call(arguments, 0)));
    }
    catch(ex) {
      Components.utils.reportError(ex);
    }
  },
  
  _getMessage: function() {
    var msg = "", argN;
    
    if (arguments.length == 1) {
      return this._getAsString( arguments[0] );
    }
    
    for (var i=0 ; i<arguments.length ; i++) {
        msg += this._getAsString( arguments[i] );
    }
    
    return msg;
    
  },
  
  _getAsString: function(argN) {
    if (argN instanceof String) {
      return argN;
    }
    if (typeof argN == "object") {
      return utils.stringify(argN, true);
    }
    
    return argN;      
  },

  error: function(msg) {
    Cu.reportError(msg);
  },
  
  destroy: function(){
    gConsoleService = null;
  }


};


