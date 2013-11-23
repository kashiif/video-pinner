'use strict;'

/*********************************************************************************
* Author: Kashif Iqbal Khan
* Email: kashiif@gmail.com
* Mozilla Developer profile: https://addons.mozilla.org/en-US/firefox/user/1803731/
*********************************************************************************/

var EXPORTED_SYMBOLS = ['videoPinner'];
/*************************************************************************************
* The core module for Video Pinner.
* Workflow:
*   bootstrap.startup() --------------------------------> videoPinner.init()
*                       ---(for all existing windows)---> videoPinner.bind()
*         window.load() --------------------------------> videoPinner.bind()
*         window.unload() ------------------------------> videoPinner.unbind()
*   bootstrap.shutdown() -------------------------------> videoPinner.uninit()
**************************************************************************************/



var videoPinner = {
  _propertyFile: null,

  /**
  * Initialization function of extension core module. Called once at the start-up/extension activation/extension upgrade
  */
	init: function(propertyFile) {
		var consoleService = Components.classes['@mozilla.org/consoleservice;1']
                            .getService(Components.interfaces.nsIConsoleService);
    // temporary function
		this.debug = function (message) {
			consoleService.logStringMessage('Video Pinner: ' + message);
		}
  
    Components.utils.import('resource://video-pinner/ext-contents/firefox/lib/common.jsm', this);

    this._propertyFile = propertyFile;
    this.logger.init('Video Pinner');

		// __debug__ // /* 
    // The code block between __debug__ will be removed by build script
		this.log = function (message) {
			this.logger.log(message);
		}
		this.debug = function (message) {
			this.logger.debug(message);
		}
		this.error = function (message) {
			this.logger.error(message);
		}
		// __debug__ // */

    this._prefManager.watch(this.handlePrefChanged);
    
    
    
    this.debug('init complete');
  },

  /**
  * destructor function of extension core module. Called once at the extension deactivation
  */
	uninit: function() {

    this.debug('Uninit called. Extension is either disabled or uninstalled.');

    this._propertyFile.destroy();
    this.logger.destroy();

    // unloadCommonJsm comes from common.jsm module
    this.unloadCommonJsm();

    // unload whatever we loaded
    Components.utils.unload('resource://video-pinner/ext-contents/firefox/lib/common.jsm');
  },

	bind: function (window) {
		window.setTimeout(function() { videoPinner._handleLoad(window); }, 500);		
	},
	
	unbind : function (window) {
		var document = window.document;
	
		// unbind gBrowser  event
		var gBrowser = document.getElementById("content");
		gBrowser.removeEventListener("DOMContentLoaded", videoPinner.handleDOMContentLoaded, false);	
	
	},

  /**
  * The delayed load handler for the windows
  */
	_handleLoad: function (window) {
		var document = window.document;

		// bind gBrowser event
		var gBrowser = document.getElementById("content");
		gBrowser.addEventListener("DOMContentLoaded", videoPinner._handleDOMContentLoaded, false);
		
	},

  handlePrefChanged: function(prefName, newValue) {
  },
	
	log : function (message) {
	},

	debug : function (message) {
	},

	error : function (message) {
	},

  /********************************** Content Document Processing *****************************/
	/*********************************************************************************************/

  handleDOMContentLoaded: function(evt) {
    var doc = evt.target,
        window = doc.defaultView;

    if (!window.location.href.startsWith("http")) return;

    if (!("documentElement" in doc)) return;

    // ignore if triggered by frame or XUL documents
    if (window.frameElement || doc.documentElement.tagName != "HTML") return;

    videoPinner._processContentDoc(doc);
  },

  _processContentDoc: function(doc) {
    this.debug("_processContentDoc");
    var window = doc.defaultView;

    if (!docUrl.startsWith("http")) return;

    // Check here if we need to process this page or not

    try {
      for (var i=0 ; i<scripts.length ; i++) {
        this.injectScript(doc, this.platform.contentScriptUrl + scripts[i]);
      }
      this.debug("script injected");
    }
    catch (e) {
      this.debug(e);
    }    
    
  },
	/*********************************************************************************************/



};