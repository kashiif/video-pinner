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

  /**
  * Initialization function of extension core module. Called once at the start-up/extension activation/extension upgrade
  */
	init: function() {
		var consoleService = Components.classes['@mozilla.org/consoleservice;1']
                            .getService(Components.interfaces.nsIConsoleService);
    // temporary function
		this.debug = function (message) {
			consoleService.logStringMessage('Video Pinner: ' + message);
		}
  
    Components.utils.import('resource://video-pinner/ext-contents/firefox/lib/common.jsm', this);

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

    
    this.debug('init complete');
  },

  /**
  * destructor function of extension core module. Called once at the extension deactivation
  */
	uninit: function() {

    this.debug('Uninit called. Extension is either disabled or uninstalled.');

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
		gBrowser.removeEventListener("DOMContentLoaded", videoPinner._handleDOMContentLoaded, false);	
	
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

	log : function (message) {
	},

	debug : function (message) {
	},

	error : function (message) {
	},

  /********************************** Content Document Processing *****************************/
	/*********************************************************************************************/

	isYouTubeVideoPage: function(doc) {
    const isYoutube = /(\w*\.)?youtube\.(com|com\.br|fr|jp|nl|pl|ie|co\.uk|es|it)$/i;

    return isYoutube.test(doc.location.host);
	},

	getVideoTag: function(doc) {
		//this.debug('querySelector: '  + doc.querySelector('#movie_player-html5 video'));
		//return doc.querySelector('#movie_player-html5 video');
		return doc.querySelector('#movie_player video');
	},

  _handleDOMContentLoaded: function(evt) {
    var doc = evt.target,
        window = doc.defaultView;

    videoPinner.debug("_handleDOMContentLoaded. ", window.frameElement, doc.documentElement ? doc.documentElement.tagName:"<no document element>");

    if (!window.location.href.startsWith("http")) return;

    if (!("documentElement" in doc)) return;

    // ignore if triggered by frame or XUL documents
    if (window.frameElement || doc.documentElement.tagName != "HTML") return;

    // Check here if we need to process this page or not
		if (!videoPinner.isYouTubeVideoPage(doc)) return;

    videoPinner._processYoutubeDoc(doc);
  },

  _processYoutubeDoc: function(doc) {
    this.debug("_processYoutubeDoc");

		var v = this.getVideoTag(doc);
		
		this.debug("videoTag on page: " + v);
		
		if (v) {
			this._processVideoTag(doc, v);
		}
		else {
			// Youtube change on 2012-12-07 

			// create an observer instance
			var observer = new doc.defaultView.MutationObserver(function(mutations, obs) {
				videoPinner._handleMutation(mutations, obs);
			});
		 
			// configuration of the observer:
			var config = { childList: true};
			 
			// pass in the target node, as well as the observer options
			observer.observe(doc.body, config);		 

			doc.addEventListener('unload', function(evt) {
				// later, you can stop observing
				observer.disconnect();

			});
		}
    
  },
  
	_handleMutation: function(mutRecords, theObserver) {
		var page = mutRecords[0].target.ownerDocument,
			v = this.getVideoTag(page);
		this.debug('videoTag on page Mutation: ' + v);
		if (v) {

			/*
			for (var i = 0; i < mutRecords.length; ++i) {
				var mutRecord = mutRecords[i]; 
				for (var j = 0; j < mutRecord.addedNodes.length; ++j) {
					var node = mutRecord.addedNodes[j]; 
					this.debug(node.tagName + ' ' + node.id  );
				}			
			}
			*/			

			theObserver.disconnect();

			this._processVideoTag(page, v);
		}
	},
  
  _processVideoTag: function(document, v) {
    this.debug('found video: ' + v.tagName + document);
    
    //! https://github.com/tforbus/youtube-fixed-video-bookmarklet/blob/master/script.js

    var window, player, content, sideWatch, footer, playerRect;

    //this.debug('_processVideoTag1 ' + document.defaultView);
    try {
      window = document.defaultView;
      player = document.getElementById('player');
      content = document.getElementById('watch7-content');
      sideWatch = document.getElementById('watch7-sidebar');
      footer = document.getElementById('footer-container');
      playerRect = player.getBoundingClientRect();

      //this.debug('_processVideoTag2: ', player, content, sideWatch, footer, playerRect);
     

      footer.style.visibility = 'hidden';

      this.debug('_processVideoTag4 ' + player + ", " + sideWatch + ", " + playerRect);
      
      window.addEventListener('scroll', function(e) {
          if(window.pageYOffset >= playerRect.top && window.pageYOffset > 0) {
            videoPinner._stylize(player,{
                position: 'fixed',
                top: '0',
                zIndex: 999
              });

            videoPinner._stylize(sideWatch,{
                position: 'absolute',
                top: player.clientHeight+'px',
                zIndex: 998
              });
              
            videoPinner._stylize(content,{
                position: 'relative',
                top: player.clientHeight+'px',
                zIndex: 997
              });
          }
          else {
            player.style.position = ''
            player.style.top = ''

            sideWatch.style.position = ''
            sideWatch.style.top = ''

            content.style.position = ''
            content.style.top = ''
          }
        }, false);
    }
    catch (ex) {
      Components.utils.reportError(ex);
    }
      
  },
	
	_stylize: function(a, props) {
		for (var p in props) {
			a.style[p] = props[p];
		}
	},

  
	/*********************************************************************************************/



};