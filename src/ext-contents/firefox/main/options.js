'use strict;'
var videoPinnerOptions = {
	_consoleService: null,
	
	log : function (message) {
	},

	handleLoad: function (evt) {
    window.removeEventListener("load", videoPinnerOptions.handleLoad);
    window.setTimeout(function() {
        videoPinnerOptions.init();
      }, 200);		
	},

	init: function() {

		// __debug__ // /* 
		this._consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
		this.log = function (message) {
			this._consoleService.logStringMessage('videoPinner: ' + message);
		}
		// __debug__ // */
	},



};

window.addEventListener("load", videoPinnerOptions.handleLoad, false);
