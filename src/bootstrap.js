"use strict;"
/*********************************************************************************
* Author: Kashif Iqbal Khan
* Email: kashiif@gmail.com
* Mozilla Developer profile: https://addons.mozilla.org/en-US/firefox/user/1803731/
*********************************************************************************/

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

var WindowListener = {
  setupBrowserUI: function(window) {
    // Notify the extension module of the new window
    videoPinner.bind(window);
  },

  tearDownBrowserUI: function(window) {
    // Notify the extension module of the closing window
    videoPinner.unbind(window);
  },

  // nsIWindowMediatorListener functions
  onOpenWindow: function(xulWindow) {
    // A new window has opened
    let domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                             .getInterface(Ci.nsIDOMWindowInternal);

    // Wait for it to finish loading
    domWindow.addEventListener('load', function listener() {
      domWindow.removeEventListener('load', listener, false);

      // If this is a browser window then setup its UI
      if (domWindow.document.documentElement.getAttribute('windowtype') == 'navigator:browser')
        WindowListener.setupBrowserUI(domWindow);
    }, false);

  },

  onCloseWindow: function(xulWindow) {
    // A window has closed, time to cleanup
    let domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                             .getInterface(Ci.nsIDOMWindowInternal);

    if (domWindow.document.documentElement.getAttribute('windowtype') == 'navigator:browser') {
      WindowListener.tearDownBrowserUI(domWindow);
    }
  },

  onWindowTitleChange: function(xulWindow, newTitle) {
  }
};

function install(data, reason) {
}

function uninstall(data, reason) {
}

function startup(data, reason) {

  // somebody decided that bootstrapped addons won't load default prefs.
  // crashes on 19.0.2
  /*
  Cc["@mozilla.org/preferences-service;1"]
    .getService(Ci.nsIPrefServiceInternal)
    .readExtensionPrefs(data.installPath);
  */  
  
  let resource = Services.io.getProtocolHandler('resource').QueryInterface(Ci.nsIResProtocolHandler);
  let alias = Services.io.newFileURI(data.installPath);
  if (!data.installPath.isDirectory())
    alias = Services.io.newURI('jar:' + alias.spec + '!/', null, null);
  resource.setSubstitution('video-pinner', alias);

  Cu.import('resource://video-pinner/ext-contents/firefox/main/videopinner.js');
  videoPinner.init();

  let wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

  // Get the list of browser windows already open
  let windows = wm.getEnumerator('navigator:browser');
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

    WindowListener.setupBrowserUI(domWindow);
  }

  // Wait for any new browser windows to open
  wm.addListener(WindowListener);
}

function shutdown(data, reason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (reason == APP_SHUTDOWN)
    return;

    
  // Do the clean-up
  let wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

  // Get the list of browser windows already open
  let windows = wm.getEnumerator('navigator:browser');
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    // Clean up browser UI
    WindowListener.tearDownBrowserUI(domWindow);
  }

  videoPinner.uninit();

  // Unload all our modules that we imported!
  Cu.unload('resource://video-pinner/ext-contents/firefox/main/videopinner.js');

  
  // @ifdef DEBUG
  // Invalidate cache to force firefox to reload all files again
  // http://stackoverflow.com/questions/20083825/updating-firefox-addon-jsm-module-code-without-browser-restart
  var obs = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
  obs.notifyObservers(null, "startupcache-invalidate", null);
  // @endif

  
  // un-register resource protocol substitution
  let resource = Services.io.getProtocolHandler('resource').QueryInterface(Ci.nsIResProtocolHandler);
  resource.setSubstitution('video-pinner', null);

  // Stop listening for any new browser windows to open
  wm.removeListener(WindowListener);
}