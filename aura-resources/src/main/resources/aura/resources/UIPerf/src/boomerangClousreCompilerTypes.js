/*jshint expr:true*/
/** This file is used for the closure compiler in advanced mode to define custom data types and allows for better minification and type checking */

/**
 * The interface used with the BOOMR object.
 *
 * @interface
 */
function IBOOMR() {}

/**
 * @type {!string}
 */
IBOOMR.prototype.version;

/**
 * @type {?Window}
 */
IBOOMR.prototype.window;

/**
 * @type {number|undefined}
 */
IBOOMR.prototype.t_lstart;

/**
 * @type {number}
 */
IBOOMR.prototype.t_start;

/**
 * @return {!IBOOMR}
 */
IBOOMR.prototype.sendBeacon;

/**
 * The page dev calls this method when they determine the page is usable.
 * Only call this if autorun is explicitly set to false
 *
 * @return {IBOOMR};
 */
IBOOMR.prototype.page_ready;

/**
 * @param {string|Object} name
 * @param {(boolean|number|string|?Object)=} value
 * @return {!IBOOMR}
 */
IBOOMR.prototype.addVar;

/**
 * @param {...!string} arg0
 * @return {!IBOOMR}
 */
IBOOMR.prototype.removeVar;

/**
 * Kylie implementation
 * This method returns an array of timers
 *
 * @return {Object.<string, !string|number>}
 */
IBOOMR.prototype.getVars;

/**
 * Kylie implementation
 * This method return a particular timer
 *
 * @param {!string} name
 * @return {!string|number}
 */
IBOOMR.prototype.getVar;

/**
 * Kylie implementation
 * This is to clear all stats after they are beaconed out by piggybacking on Lumen requests
 *
 * @return {!IBOOMR} for chaining methods
 */
IBOOMR.prototype.removeStats;

/**
 * @param {function(?, ?)} fn
 * @param {?} data
 * @param {?} cb_data
 * @param {?} cb_scope
 */
IBOOMR.prototype.setImmediate;

/**
 * Kylie implementation
 * This is to re-init the beacon_url for one off needs
 * 
 * @param {!string} url The URL to use for beaconing data
 */
IBOOMR.prototype.setBeaconUrl;

/**
 * @param {string} message
 * @param {?string=} source
 * @return {!IBOOMR}
 */
IBOOMR.prototype.debug;

/**
 * @param {string} message
 * @param {?string=} source
 * @return {!IBOOMR}
 */
IBOOMR.prototype.info;

/**
 * @param {string} message
 * @param {?string=} source
 * @return {!IBOOMR}
 */
IBOOMR.prototype.warn;

/**
 * @param {string} message
 * @param {?string=} source
 * @return {!IBOOMR}
 */
IBOOMR.prototype.error;

/**
 * The subscribe method is used to subscribe an event handler to one of boomerang's events. It accepts four parameters
 * 
 * @param {string} e_name The event name. This may be one of page_ready, page_unload, before_beacon
 * @param {!function(?, ?)} fn A reference to the callback function that will be called when this event fires.
 * @param {(?)?} cb_data object passed as the second parameter to the callback function
 * @param {?} cb_scope If set to an object, then the callback function is called as a method of this object, and all references to this within the callback function will refer to oCallbackScope
 * @return {!IBOOMR}
 */
IBOOMR.prototype.subscribe;

/**
 * The init method that you to call to initialise boomerang. Call this method once after you've loaded the boomerang javascript. It accepts a single configuration object as a parameter
 * 
 * @param {Object.<!string, ?>?} config 
 * @return {!IBOOMR}
 */
IBOOMR.prototype.init;

/**
 * @interface
 */
function IBOOMR_utils() {}

/**
 * Utility functions
 * 
 * @type {IBOOMR_utils}
 */
IBOOMR.prototype.utils;

/**
 * @param {?T} o
 * @param {?string=} separator
 * @return {T|string}
 * @template T
 */
IBOOMR_utils.prototype.objectToString;

/**
 * @param {?string=} name
 * @return {?string}
 */
IBOOMR_utils.prototype.getCookie;

/**
 * Sets the cookie named sName to the serialized value of subcookies
 * 
 * @param {?string} name The name of the cookie
 * @param {?Object.<string, ?(number|boolean|string)>} subcookies key/value pairs to write into the cookie. These will be serialized as an & separated list of URL encoded key=value pairs
 * @param {number=} max_age Lifetime in seconds of the cookie. Set this to 0 to create a session cookie that expires when the browser is closed. If not set, defaults to 0.
 * @return {boolean} true if the cookie was set successfully. false if the cookie was not set successfully
 */
IBOOMR_utils.prototype.setCookie;

/**
 * Removes the cookie identified by sName by nullifying its value, and making it a session cookie.
 * 
 * @param {?string} name The name of the cookie
 * @return {boolean} 
 */
IBOOMR_utils.prototype.removeCookie;

/**
 * Convenience method that plugins can call to configure themselves with the config object passed in to their init() method
 * 
 * @param {!Object} o The plugin's impl object within which it stores all its configuration and private properties
 * @param {?Object.<string, ?>|undefined} config The config object passed in to the plugin's init() method
 * @param {!string} plugin_name The plugin's name in the BOOMR.plugins object
 * @param {Array.<string>} properties An array containing a list of all configurable properties that this plugin has
 */
IBOOMR_utils.prototype.pluginConfig;

/**
 * Parse a cookie string returned by getCookie() and split it into its constituent subcookies.
 * 
 * @param {string?} cookie Content of a cookie
 * @return {?Object.<!string, ?(string|number|boolean)>} On success, an object of key/value pairs of all sub cookies. Note that some subcookies may have empty values. null if sCookie was not set or did not contain valid subcookies.
 */
IBOOMR_utils.prototype.getSubCookies;