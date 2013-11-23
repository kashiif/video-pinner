'use strict;'

/*********************************************************************************
* Author: Kashif Iqbal Khan
* Email: kashiif@gmail.com
* Mozilla Developer profile: https://addons.mozilla.org/en-US/firefox/user/1803731/
*********************************************************************************/

var EXPORTED_SYMBOLS = ['platformAdapter'];

var server;

// Production environment
// The following coupons_server_url token would be replaced by build script
server = "__coupons_server_url__";

// @ifdef DEBUG
// Debug environment
server = "development_value_here";
// @endif

var platformAdapter = {
  platform: null,

  /**
  * Initialization function.
  */
	init: function(platform) {
    this.platform = platform;
  },

  destroy: function() {
    this.platform = null;
  },

    /***********************************************************
  * Returns stylesheet object from document that matches href
  *
  * @param {HTMLDocument} doc The document object
  * @param {String} href String representing the URI of stylesheet
  *
  ************************************************************/
  getStylesheet: function(doc, href) {
    var styleSheet = null;
    for(var i=0 ; i<doc.styleSheets.length; i++) {
      var s1 = doc.styleSheets[i];
      if (s1.href == href) {
        styleSheet = s1;
        break;
      }
    }
    return styleSheet;
  },

  /***********************************************************
  * Returns script object from document that matches src
  *
  * @param {HTMLDocument} doc The document object
  * @param {String} src String representing the URI of script
  *
  ************************************************************/
  getScript: function(doc, src) {
    var script = null;
    for(var i=0 ; i<doc.scripts.length; i++) {
      var s1 = doc.scripts[i];
      if (s1.src == src) {
        script = s1;
        break;
      }
    }
    return script;
  },

  /***************************************************************
  * Inserts a stylesheet into document if it is not included already
  *
  * @param {HTMLDocument} doc The document object
  * @param {String} href String representing the URI of stylesheet
  *
  * @returns {boolean} true if <style> tag was inserted into the document;
  *         Otherwise false.
  *
  ****************************************************************/
  injectStyleSheet: function(doc, href) {
    if (this.getStylesheet(doc, href) == null) {
        var nodeToInsert = doc.createElement('link');
        nodeToInsert.setAttribute('rel', 'stylesheet');
        nodeToInsert.setAttribute('type', 'text/css');
        nodeToInsert.setAttribute('href', href);
        doc.head.appendChild(nodeToInsert);
        return true;
    }
    return false;
  },

  /***************************************************************
  * Inserts a script into document if it is not included already
  *
  * @param {HTMLDocument} doc The document object
  * @param {String} href String representing the URI of script
  *
  * @returns {boolean} true if <script> tag was inserted into the document;
  *         Otherwise false.
  *
  ****************************************************************/
  injectScript: function(doc, href) {
    if (this.getScript(doc, href) == null) {
        var nodeToInsert = doc.createElement('script');
        nodeToInsert.setAttribute('type', 'text/javascript');
        nodeToInsert.setAttribute('src', href);
        doc.head.appendChild(nodeToInsert);
        return true;
    }
    return false;
  },

  handleDOMContentLoaded: function(evt) {
    /*
    platformAdapter.platform.debug(   "evt.target: " + evt.target
                  + "; evt.originalTarget: " + evt.originalTarget
                  + "; evt.currentTarget: " + evt.currentTarget);
    //*/

    /*
    platformAdapter.platform.debug(evt.target);
    platformAdapter.platform.debug("---------------------------------");
    platformAdapter.platform.debug(evt.target.documentElement);
    //*/

    var doc = evt.target;
    platformAdapter.handleDOMContentLoadedCore(doc);
  },

  handleDOMContentLoadedCore: function(doc) {
    //platform.getPref("toolbarenabled", function(toolbarenabled){
        var platform = platformAdapter.platform;
        //if (!toolbarenabled) return;
        if (!("documentElement" in doc)) return;

        // ignore if triggered by frame or XUL documents
        if (doc.defaultView.frameElement || doc.documentElement.tagName != "HTML") return;

        platformAdapter._processContentDoc(doc);
        doc.defaultView.addEventListener("videoPinnerEvent", function(evt) { platformAdapter._handleCustomEvent(evt);}, false);
      //});
  },

  _processContentDoc: function(doc) {
    platformAdapter.platform.debug("_processContentDoc");
    var window = doc.defaultView,
        storeUrl = window.location.href,
        domain, cacheRecord;

    //platformAdapter.platform.log("storeUrl.startsWith('http') " + storeUrl.startsWith("http"));
    if (!storeUrl.startsWith("http")) return;

    domain = storeUrl.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];

    // Check here if we need to process this page or not

    var scripts = null;

    // Production value - Grunt concats "lib-dev.js" and "dom-construction-dev.js" to "common-content.js"
    scripts = ["common-content.js"];

    // @ifdef DEBUG
    // Development value
    scripts = ["lib-dev.js", "dom-construction-dev.js"];
    // @endif

    try {
      this.platform.debug("_processContentDoc: Injecting css");
      this.injectStyleSheet(doc, this.platform.contentScriptUrl + "style.css");
      this.platform.debug("_processContentDoc: Injecting script");

      for (var i=0 ; i<scripts.length ; i++) {
        this.injectScript(doc, this.platform.contentScriptUrl + scripts[i]);
      }
      this.platform.debug("script injected");
    }
    catch (e) {
      this.platform.debug(e);
    }    
    
  },

  _handleCustomEvent: function(evt) {
    this.platform.debug("_handleCustomEvent");
    this.platform.debug(evt.detail);
    var elem = evt.target,
        w = elem.ownerDocument.defaultView;

    switch(evt.detail.command) {
    }
    
  },

  _reportError: function(errMsg) {
    this.platform.error(errMsg);
  },

  handlePrefChanged: function(prefName, newValue) {
  },

};