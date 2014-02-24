/*jshint sub:true*/

/**
 * @license Copyright (c) 2011, Yahoo! Inc.  All rights reserved.
 * Copyright (c) 2012, Log-Normal, Inc.  All rights reserved.
 * Copyright (c) 2013, SOASTA, Inc. All rights reserved.
 * Copyright (c) 2013, Salesforce.com. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/**
\file boomerang.js
boomerang measures various performance characteristics of your user's browsing
experience and beacons it back to your server.

\details
To use this you'll need a web site, lots of users and the ability to do
something with the data you collect.  How you collect the data is up to
you, but we have a few ideas.
*/

/**
 * Measure the time the script started
 * This has to be global so that we don't wait for the entire
 * BOOMR function to download and execute before measuring the
 * time.  This is the only way that works on Internet Explorer
 * 
 * @type {!number}
 * @const
 */
var BOOMR_start = new Date().getTime();

/**
 * Short namespace because I don't want to keep typing BOOMERANG
 * 
 * 
 * @type {!IBOOMR}
 * @namespace
 */
var BOOMR;

/**
 * @define {!string}
 */
var BEACON_URL = "";

/**
 * @param {!Window} w
 * @private
 */
function run(w) {

    // This is the only block where we use document without the w. qualifier
    if (w.parent !== w && document.getElementById("boomr-if-as") && document.getElementById("boomr-if-as").nodeName.toLowerCase() === "script") {
        w = w.parent;
    }

    /** 
     * @type {!Document}
     * @const
     */
    var d = w.document;

    /**
     * @type {Object.<string, !(?)>}
     * @const
     */
    var perfOptions = w["perfOptions"] || {};

    /**
     * impl is a private object not reachable from outside the BOOMR object
     * users can set properties by passing in to the init() method
     * 
     * @private
     * @const
     */
    var impl = {
        // properties
        /**
         * @type {!string}
         * @private
         */
        beacon_url: BEACON_URL,

        /**
         * strip out everything except last two parts of hostname.
         * This doesn't work well for domains that end with a country tld,
         * but we allow the developer to override site_domain for that.
         * You can disable all cookies by setting site_domain to a falsy value
         * 
         * @type {!string}
         * @private
         */
        site_domain: w.location.hostname.replace(/.*?([^.]+\.[^.]+)\.?$/, "$1").toLowerCase(),

        /**
         * User's ip address determined on the server. Used for the BA cookie
         * 
         * @type {!string}
         * @private
         */
        user_ip: "",

        /** 
         * @type {boolean}
         * @private
         */
        onloadfired: false,

        /** 
         * @type {boolean}
         * @private
         */
        handlers_attached: false,

        /**
         * @type Object.<!string, Array.<?>>
         * @const
         * @private
         */
        events: {
            "page_ready": [],
            "page_unload": [],
            "dom_loaded": [],
            "onLoad": [],
            "visibility_changed": [],
            "before_beacon": [],
            "click": []
        },

        /**
         * @dict
         * @private
         */
        vars: {},

        /**
         * @type {Object.<!string, number>}
         */
        disabled_plugins: {},

        /**
         * @param {Event?} ev
         */
        onclick_handler: function (ev) {
            var target;
            if (!ev) {
                ev = w.event;
            }
            if (ev.target) {
                target = ev.target;
            } else if (ev.srcElement) {
                target = ev.srcElement;
            }

            // don't capture clicks on flash objects
            // because of context slowdowns in PepperFlash
            if (!target || (target.nodeName.toUpperCase() === "OBJECT" && target.type === "application/x-shockwave-flash")) {
                return;
            }
            
            if (target.nodeType === 3) {// defeat Safari bug
                target = target.parentNode;
            }
            
            impl.fireEvent("click", target);
        },

        /**
         * @param {!string} e_name
         * @param {?=} data
         * @return {boolean}
         */
        fireEvent: function (e_name, data) {
            var i,
                h,
                e;
            if (!impl.events.hasOwnProperty(e_name)) {
                return false;
            }

            e = impl.events[e_name];

            for (i = 0; i < e.length; i++) {
                h = e[i];
                h[0].call(h[2], data, h[1]);
            }

            return true;
        }
    };

    /**
     * We create a boomr object and then copy all its properties to BOOMR so that
     * we don't overwrite anything additional that was added to BOOMR before this
     * was called... for example, a plugin.
     * 
     * @private
     * @const
     * @type {!IBOOMR}
     */
    var boomr = /** @lends {boomr} */ {
        /**
         * @type {number|undefined}
         */
        t_lstart: undefined,
        /**
         * @type {number}
         */
        t_start: BOOMR_start,
        /**
         * @type {?number}
         */
        t_end: null,
        
        /** @type {Object.<!string, !IPlugin>} */
        plugins: {},
        
        /**
         * @type {!string}
         * @const
         */
        version: "0.9",
        
        /**
         * @type {?Window}
         */
        window: w,

        /**
         * Utility functions
         * 
         * @namespace
         */
        utils: {
            /**
             * @param {?T} o
             * @param {?string=} separator
             * @return {T|string}
             * @template T
             */
            objectToString: function (o, separator) {
                var value = [], l;

                if (!o || typeof o !== "object") {
                    return o;
                }
                if (separator === undefined) {
                    separator = "\n\t";
                }

                for (l in o) {
                    if (Object.prototype.hasOwnProperty.call(o, l)) {
                        value.push(encodeURIComponent(l) + "=" + encodeURIComponent(o[l]));
                    }
                }

                return value.join(separator);
            },

            /**
             * @param {?string=} name
             * @return {?string}
             */
            getCookie: function (name) {
                if (!name) {
                    return null;
                }

                name = " " + name + "=";

                var i, cookies;
                cookies = " " + d.cookie + ";";
                if ((i = cookies.indexOf(name)) >= 0) {
                    i += name.length;
                    cookies = cookies.substring(i, cookies.indexOf(";", i));
                    return cookies;
                }

                return null;
            },

            /**
             * Sets the cookie named sName to the serialized value of subcookies
             * 
             * @param {?string} name The name of the cookie
             * @param {?Object.<string, ?(number|boolean|string)>} subcookies key/value pairs to write into the cookie. These will be serialized as an & separated list of URL encoded key=value pairs
             * @param {number=} max_age Lifetime in seconds of the cookie. Set this to 0 to create a session cookie that expires when the browser is closed. If not set, defaults to 0.
             * @return {boolean} true if the cookie was set successfully. false if the cookie was not set successfully
             */
            setCookie: function (name, subcookies, max_age) {
                var value, nameval, c, exp;

                if (!name || !impl.site_domain) {
                    return false;
                }

                value = boomr.utils.objectToString(subcookies, "&");
                nameval = name + "=" + value;

                c = [nameval, "path=/", "domain=" + impl.site_domain];
                if (max_age) {
                    exp = new Date();
                    exp.setTime(exp.getTime() + max_age * 1000);
                    exp = exp.toGMTString();
                    c.push("expires=" + exp);
                }

                if (nameval.length < 4000) {
                    d.cookie = c.join("; ");
                    // confirm cookie was set (could be blocked by user's settings, etc.)
                    return (value === boomr.utils.getCookie(name));
                }

                return false;
            },

            /**
             * Parse a cookie string returned by getCookie() and split it into its constituent subcookies.
             * 
             * @param {string?} cookie Content of a cookie
             * @return {?Object.<!string, ?(string|number|boolean)>} On success, an object of key/value pairs of all sub cookies. Note that some subcookies may have empty values. null if sCookie was not set or did not contain valid subcookies.
             */
            getSubCookies: function (cookie) {
                var cookies_a,
                    i,
                    l,
                    kv,
                    cookies = {};

                if (!cookie) {
                    return null;
                }

                cookies_a = cookie.split("&");

                if (cookies_a.length === 0) {
                    return null;
                }

                for (i = 0, l = cookies_a.length; i < l; i++) {
                    kv = cookies_a[i].split("=");
                    kv.push("");    // just in case there's no value
                    cookies[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
                }

                return cookies;
            },

            /**
             * Removes the cookie identified by sName by nullifying its value, and making it a session cookie.
             * 
             * @param {?string} name The name of the cookie
             * @return {boolean} 
             */
            removeCookie: function (name) {
                return boomr.utils.setCookie(name, {}, 0);
            },

            /**
             * Convenience method that plugins can call to configure themselves with the config object passed in to their init() method
             * 
             * @param {!Object} o The plugin's impl object within which it stores all its configuration and private properties
             * @param {?Object.<string, ?>|undefined} config The config object passed in to the plugin's init() method
             * @param {!string} plugin_name The plugin's name in the BOOMR.plugins object
             * @param {Array.<string>} properties An array containing a list of all configurable properties that this plugin has
             */
            pluginConfig: function (o, config, plugin_name, properties) {
                var i, props = 0;

                if (!config || !config[plugin_name]) {
                    return false;
                }

                for (i = 0; i < properties.length; i++) {
                    if (config[plugin_name][properties[i]] !== undefined) {
                        o[properties[i]] = config[plugin_name][properties[i]];
                        props++;
                    }
                }

                return (props > 0);
            },

            /**
             * @param {!Window|EventTarget} el
             * @param {!string} type
             * @param {function(Event?)} fn
             * @private
             */
            addListener: function (el, type, fn) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, false);
                } else {
                    el.attachEvent("on" + type, fn);
                }
            }
        },

        /**
         * The init method that you to call to initialise boomerang. Call this method once after you've loaded the boomerang javascript. It accepts a single configuration object as a parameter
         * 
         * @param {Object.<!string, ?>?} config 
         * @return {!IBOOMR}
         */
        init: function (config) {
            var i,
                l = null,
                properties = ["beacon_url", "site_domain", "user_ip"];

            if (!config) {
                config = {};
            }

            for (i = 0; i < properties.length; i++) {
                if (config[properties[i]] !== undefined) {
                    impl[properties[i]] = config[properties[i]];
                }
            }

            if (config.log !== undefined) {
                boomr.log = config.log;
            }
            if (!boomr.log) {
                boomr.log = function (/*m, l, s*/) { };
            }

            for (l in boomr.plugins) {
                if (boomr.plugins.hasOwnProperty(l)) {
                    // config[pugin].enabled has been set to false
                    if (config[l] && config[l].hasOwnProperty("enabled") && config[l].enabled === false) {
                        impl.disabled_plugins[l] = 1;
                        continue;
                    }
                    if (impl.disabled_plugins[l]) {
                        delete impl.disabled_plugins[l];
                    }

                    // plugin exists and has an init method
                    if (typeof boomr.plugins[l].init === "function") {
                        boomr.plugins[l].init(config);
                    }
                }
            }

            if (impl.handlers_attached) {
                return boomr;
            }

            // The developer can override onload by setting autorun to false
            if (!impl.onloadfired && (config.autorun === undefined || config.autorun !== false)) {
                if (d.readyState && d.readyState === "complete") {
                    boomr.setImmediate(boomr.page_ready, null, null, boomr);
                } else {
                    if (w["onpagehide"] || w["onpagehide"] === null) {
                        boomr.utils.addListener(w, "pageshow", boomr.page_ready);
                    } else {
                        boomr.utils.addListener(w, "load", boomr.page_ready);
                    }
                }
            }

            boomr.utils.addListener(w, "DOMContentLoaded", function () { impl.fireEvent("dom_loaded"); });

            (function () {
                // visibilitychange is useful to detect if the page loaded through prerender
                // or if the page never became visible
                // http://www.w3.org/TR/2011/WD-page-visibility-20110602/
                // http://www.nczonline.net/blog/2011/08/09/introduction-to-the-page-visibility-api/
                var fire_visible = function () { impl.fireEvent("visibility_changed"); };
                if (d["webkitVisibilityState"]) {
                    boomr.utils.addListener(d, "webkitvisibilitychange", fire_visible);
                } else if (d["msVisibilityState"]) {
                    boomr.utils.addListener(d, "msvisibilitychange", fire_visible);
                } else if (d.visibilityState) {
                    boomr.utils.addListener(d, "visibilitychange", fire_visible);
                }

                boomr.utils.addListener(d, "mouseup", impl.onclick_handler);

                if (!w["onpagehide"] && w["onpagehide"] !== null) {
                    // This must be the last one to fire
                    // We only clear w on browsers that don't support onpagehide because
                    // those that do are new enough to not have memory leak problems of
                    // some older browsers
                    boomr.utils.addListener(w, "unload", function () {
                        delete boomr.window;
                    });
                }
            }());

            impl.handlers_attached = true;
            return boomr;
        },

        /**
         * The page dev calls this method when they determine the page is usable.
         * Only call this if autorun is explicitly set to false
         * 
         * @return {!IBOOMR}
         */
        page_ready: function () {
            if (impl.onloadfired) {
                return boomr;
            }
            impl.fireEvent("page_ready");
            impl.onloadfired = true;
            return boomr;
        },

        /**
         * @param {function(?, ?)} fn
         * @param {?} data
         * @param {?} cb_data
         * @param {?} cb_scope
         */
        setImmediate: function (fn, data, cb_data, cb_scope) {
            /** @type {?} */
            var cb = function () {
                fn.call(cb_scope || null, data, cb_data || {});
                cb = null;
            };

            if (w.setImmediate) {
                w.setImmediate(cb);
            } else if (w["msSetImmediate"]) {
                w["msSetImmediate"](cb);
            } else if (w["webkitSetImmediate"]) {
                w["webkitSetImmediate"](cb);
            } else if (w["mozSetImmediate"]) {
                w["mozSetImmediate"](cb);
            } else {
                setTimeout(cb, 10);
            }
        },

        /**
         * The subscribe method is used to subscribe an event handler to one of boomerang's events. It accepts four parameters
         * 
         * @param {string} e_name The event name. This may be one of page_ready, page_unload, before_beacon
         * @param {!function(?, ?)} fn A reference to the callback function that will be called when this event fires.
         * @param {(?)?} cb_data object passed as the second parameter to the callback function
         * @param {?} cb_scope If set to an object, then the callback function is called as a method of this object, and all references to this within the callback function will refer to oCallbackScope
         * @return {!IBOOMR}
         */
        subscribe: function (e_name, fn, cb_data, cb_scope) {
            var i, h, e, unload_handler;

            if (!impl.events.hasOwnProperty(e_name)) {
                return boomr;
            }

            e = impl.events[e_name];

            // don't allow a handler to be attached more than once to the same event
            for (i = 0; i < e.length; i++) {
                h = e[i];
                if (h[0] === fn && h[1] === cb_data && h[2] === cb_scope) {
                    return boomr;
                }
            }
            e.push([ fn, cb_data || {}, cb_scope || null ]);

            // attaching to page_ready after onload fires, so call soon
            if (e_name === "page_ready" && impl.onloadfired) {
                boomr.setImmediate(fn, null, cb_data, cb_scope);
            }

            // Attach unload handlers directly to the window.onunload and
            // window.onbeforeunload events. The first of the two to fire will clear
            // fn so that the second doesn't fire. We do this because technically
            // onbeforeunload is the right event to fire, but all browsers don't
            // support it.  This allows us to fall back to onunload when onbeforeunload
            // isn't implemented
            if (e_name === "page_unload") {
                unload_handler = function (ev) {
                    if (fn) {
                        fn.call(cb_scope, ev || w.event, cb_data);
                    }
                };
                // pagehide is for iOS devices
                // see http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
                if (w["onpagehide"] || w["onpagehide"] === null) {
                    boomr.utils.addListener(w, "pagehide", unload_handler);
                } else {
                    boomr.utils.addListener(w, "unload", unload_handler);
                }
                boomr.utils.addListener(w, "beforeunload", unload_handler);
            }

            return boomr;
        },

        /**
         * @param {string|Object} name
         * @param {(boolean|number|string|?Object)=} value
         * @return {!IBOOMR}
         */
        addVar: function (name, value) {
            if (typeof name === "string") {
                impl.vars[name] = value;
            } else if (typeof name === "object") {
                var o = name,
                    l;
                for (l in o) {
                    if (o.hasOwnProperty(l)) {
                        impl.vars[l] = o[l];
                    }
                }
            }
            return boomr;
        },

        /**
         * @param {...!string} arg0
         * @return {!IBOOMR}
         */
        removeVar: function (arg0) {
            var i, params;
            if (!arguments.length) {
                return boomr;
            }

            if (arguments.length === 1 && Object.prototype.toString.apply(arg0) === "[object Array]") {
                params = arg0;
            } else {
                params = arguments;
            }

            for (i = 0; i < params.length; i++) {
                if (impl.vars["hasOwnProperty"](params[i])) {
                    delete impl.vars[params[i]];
                }
            }

            return boomr;
        },

        /**
         * Kylie implementation
         * This method returns an array of timers
         *
         * @return !Object.<!string, (boolean|number|string|Object)>
         */
        getVars: function () {
            return impl.vars;
        },

        /**
         * Kylie implementation
         * This method return a particular timer
         *
         * @param {!string} name
         * @return {!string|number}
         */
        getVar: function (name) {
            return impl.vars[name];
        },

        /**
         * Kylie implementation
         * This is to clear all stats after they are beaconed out by piggybacking on Lumen requests
         *
         * @return {!IBOOMR} for chaining methods
         */
        removeStats: function () {
            impl.vars = {};
            boomr.plugins.RT.clearTimers();
            return boomr;
        },

        /**
         * @return {!IBOOMR}
         */
        sendBeacon: function () {
            var l,
                url,
                img,
                nparams = 0;

            // At this point someone is ready to send the beacon.  We send
            // the beacon only if all plugins have finished doing what they
            // wanted to do
            for (l in boomr.plugins) {
                if (boomr.plugins.hasOwnProperty(l)) {
                    if (impl.disabled_plugins[l]) {
                        continue;
                    }
                    if (!boomr.plugins[l].is_complete()) {
                        return boomr;
                    }
                }
            }

            impl.vars["v"] = boomr.version;
            impl.vars["u"] = d.URL.replace(/#.*/, "");
            // use d.URL instead of location.href because of a safari bug
            if (w !== window) {
                impl.vars["if"] = "";
            }

            // If we reach here, all plugins have completed
            impl.fireEvent("before_beacon", impl.vars);

            // Don't send a beacon if no beacon_url has been set
            // you would do this if you want to do some fancy beacon handling
            // in the `before_beacon` event instead of a simple GET request
            if (!impl.beacon_url) {
                return boomr;
            }

            // if there are already url parameters in the beacon url,
            // change the first parameter prefix for the boomerang url parameters to &

            url = [];

            for (l in impl.vars) {
                if (impl.vars["hasOwnProperty"](l)) {
                    nparams++;
                    url.push(encodeURIComponent(l) + "=" + ((impl.vars[l] === undefined || impl.vars[l] === null) ? "" : encodeURIComponent(impl.vars[l] + "")));
                }
            }

            url = impl.beacon_url + ((impl.beacon_url.indexOf("?") > -1) ? "&" : "?") + url.join("&");

            boomr.debug("Sending url: " + url.replace(/&/g, "\n\t"));

            // only send beacon if we actually have something to beacon back
            if (nparams) {
                img = new Image();
                img.src = url;
            }

            return boomr;
        },

        /**
         * Kylie implementation
         * This is to re-init the beacon_url for one off needs
         * 
         * @param {!string} url The URL to use for beaconing data
         */
        setBeaconUrl: function (url) {
            impl.beacon_url = url;
        }
    };

    // Kylie implementation
    if (typeof perfOptions["BOOMR_lstart"] === "number") {
        boomr.t_lstart = perfOptions["BOOMR_lstart"];
    } else {
        boomr.t_lstart = 0;
    }
    delete perfOptions["BOOMR_lstart"];

    (function () {
        /**
         * @param {!string} l error log
         * @return {function(string, ?string=)}
         */
        function make_logger (l) {
            /**
             * @param {string} m
             * @param {?string=} s 
             * @return {!IBOOMR}
             */
            return function (m, s) {
                boomr.log(m, l, "boomerang" + (s ? "." + s : ""));
                return boomr;
            };
        }

        /**
         * @param {string} message
         * @param {?string=} source
         * @return {!IBOOMR}
         */
        boomr.debug = make_logger("debug");
        /**
         * @param {string} message
         * @param {?string=} source
         * @return {!IBOOMR}
         */
        boomr.info = make_logger("info");
        /**
         * @param {string} message
         * @param {?string=} source
         * @return {!IBOOMR}
         */
        boomr.warn = make_logger("warn");
        /**
         * @param {string} message
         * @param {?string=} source
         * @return {!IBOOMR}
         */
        boomr.error = make_logger("error");
    }());

    if (w.YAHOO && w.YAHOO.widget && w.YAHOO.widget.Logger) {
        boomr.log = w.YAHOO.log;
    } else if (w.Y && w.Y.log) {
        boomr.log = w.Y.log;
    } else if (typeof w.console === "object" && w.console.log !== undefined) {
        boomr.log = function (m, l, s) { w.console.log(s + ": [" + l + "] " + m); };
    }

    BOOMR = boomr;
}
run(window);

//end of boomerang beaconing section
//Now we start built in plugins.