/*
 * Copyright (c) 2011, Yahoo! Inc.  All rights reserved.
 * Copyright (c) 2012, Log-Normal, Inc.  All rights reserved.
 * Copyright (c) 2013, Salesforce.com  All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/*jshint sub:true*/

/**
 * This is the Round Trip Time plugin. Abbreviated to RT the parameter is the window
 * 
 * @param {Window} w
 * @private
 */
function runrt(w) {

    /**
     * @type {Document}
     */
    var d = w.document;

    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    /**
     * @struct
     * @private
     */
    var impl = {
        /** @type {!boolean} */
        initialized: false,    //! Set when init has completed to prevent double initialization
        /** @type {!boolean} */
        onloadfired : false,
        /** @type {!boolean} */
        visiblefired : false,
        /** @type {!boolean} */
        complete : false, // ! Set when this plugin has completed
        timers : {}, // ! Custom timers that the developer can use
        // Format for each timer is { start: XXX, end: YYY, delta: YYY-XXX }
        /**
         * Name of the cookie that stores the start time and referrer
         * @type {!string}
         */
        cookie : 'RT',
        /**
         * Cookie expiry in seconds
         * @type {!number}
         */
        cookie_exp : 1800,
        /** @type {!boolean} */
        strict_referrer : false, // ! By default, don't beacon if referrers don't match.
        // If set to false, beacon both referrer values and let
        // the back end decide
        /** @type {number} */
        navigationType : 0,
        /** @type {number|undefined} */
        navigationStart : undefined,
        /** @type {number|undefined} */
        responseStart : undefined,
        /**
         * 2**32 -1
         * @type {!string}
         */
        sessionID : Math.floor(Math.random() * 4294967296).toString(36),
        /** @type {number|undefined} */
        sessionStart : undefined,
        sessionLength : 0,
        t_start : undefined,
        t_fb_approx: undefined,
        r : undefined,
        r2 : undefined,

        /**
         * @param {?string=} how
         * @param {?(boolean|string)=} url
         * @private
         */
        setCookie: function (how, url) {
            var t_end, t_start, subcookies;

            // Disable use of RT cookie by setting its name to a falsy value
            if (!impl.cookie) {
                return impl;
            }

            subcookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie)) || {};
            // We use document.URL instead of location.href because of a bug in safari 4
            // where location.href is URL decoded
            if (how === "ul" || how === "hd") {
                subcookies["r"] = d.URL.replace(/#.*/, '');
            }

            if (how === "cl") {
                if (url) {
                    subcookies["nu"] = url;
                } else if (subcookies["nu"]) {
                    delete subcookies["nu"];
                }
            }
            if (url === false) {
                delete subcookies["nu"];
            }

            t_start = new Date().getTime();

            if (how) {
                subcookies[how] = t_start;
            }

            BOOMR.debug("Setting cookie " + BOOMR.utils.objectToString(subcookies), "rt");
            if (!BOOMR.utils.setCookie(impl.cookie, subcookies, impl.cookie_exp)) {
                BOOMR.error("cannot set start cookie", "rt");
                return impl;
            }

            t_end = new Date().getTime();
            if (t_end - t_start > 50) {
                // It took > 50ms to set the cookie
                // The user Most likely has cookie prompting turned on so
                // t_start won't be the actual unload time
                // We bail at this point since we can't reliably tell t_done
                BOOMR.utils.removeCookie(impl.cookie);

                // at some point we may want to log this info on the server side
                BOOMR.error("took more than 50ms to set cookie... aborting: " + t_start + " -> " + t_end, "rt");
            }

            return impl;
        },

        initFromCookie: function () {
            var subcookies;

            if (!impl.cookie) {
                return;
            }

            subcookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie));

            if (!subcookies) {
                return;
            }

            subcookies["s"] = Math.max(+subcookies["ul"] || 0, +subcookies["cl"] || 0);

            BOOMR.debug("Read from cookie " + BOOMR.utils.objectToString(subcookies), "rt");
            if (subcookies["s"] && (subcookies["r"] || subcookies["nu"])) {
                impl.r = subcookies["r"];

                BOOMR.debug(impl.r + " =?= " + impl.r2, "rt");
                BOOMR.debug(subcookies["s"] + " <? " + (+subcookies["cl"] + 15), "rt");
                BOOMR.debug(subcookies["nu"] + " =?= " + d.URL.replace(/#.*/, ''), "rt");

                if (!impl.strict_referrer || impl.r === impl.r2 || (subcookies["s"] < +subcookies["cl"] + 15 && subcookies["nu"] === d.URL.replace(/#.*/, ''))) {
                    impl.t_start = subcookies["s"];
                    if (+subcookies["hd"] > subcookies["s"]) {
                        impl.t_fb_approx = parseInt(subcookies["hd"], 10);
                    }
                } else {
                    impl.t_start = impl.t_fb_approx = undefined;
                }
            }
            if (subcookies["sid"]) {
                (/** @suppress {checkTypes} */ function() {
                    impl.sessionID = subcookies["sid"];
                })();
            }
            if (subcookies["ss"]) {
                impl.sessionStart = parseInt(subcookies["ss"], 10);
            }
            if (subcookies["sl"]) {
                impl.sessionLength = parseInt(subcookies["sl"], 10);
            }
        },

        checkPreRender: function () {
            if (!(d["webkitVisibilityState"] && d["webkitVisibilityState"] === "prerender") && !(d["msVisibilityState"] && d["msVisibilityState"] === 3)) {
                return false;
            }

            // This means that onload fired through a pre-render.  We'll capture this
            // time, but wait for t_done until after the page has become either visible
            // or hidden (ie, it moved out of the pre-render state)
            // http://code.google.com/chrome/whitepapers/pagevisibility.html
            // http://www.w3.org/TR/2011/WD-page-visibility-20110602/
            // http://code.google.com/chrome/whitepapers/prerender.html

            BOOMR.plugins.RT.startTimer("t_load", impl.navigationStart);
            BOOMR.plugins.RT.endTimer("t_load");                    // this will measure actual onload time for a prerendered page
            BOOMR.plugins.RT.startTimer("t_prerender", impl.navigationStart);
            BOOMR.plugins.RT.startTimer("t_postrender");                // time from prerender to visible or hidden

            BOOMR.subscribe("visibility_changed", BOOMR.plugins.RT.done, null, BOOMR.plugins.RT);

            return true;
        },

        initNavTiming: function () {
            var ti, p, source;

            if (impl.navigationStart) {
                return;
            }

            // Get start time from WebTiming API see:
            // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
            // http://blogs.msdn.com/b/ie/archive/2010/06/28/measuring-web-page-performance.aspx
            // http://blog.chromium.org/2010/07/do-you-know-how-slow-your-web-page-is.html
            p = w.performance || w["msPerformance"] || w["webkitPerformance"] || w["mozPerformance"];

            if (p && p.navigation) {
                impl.navigationType = p.navigation.type;
            }

            if (p && p.timing) {
                ti = p.timing;
            } else if (w.chrome && w.chrome.csi && w.chrome.csi().startE) {
                // Older versions of chrome also have a timing API that's sort of documented here:
                // http://ecmanaut.blogspot.com/2010/06/google-bom-feature-ms-since-pageload.html
                // source here:
                // http://src.chromium.org/viewvc/chrome/trunk/src/chrome/renderer/loadtimes_extension_bindings.cc?view=markup
                ti = {
                    navigationStart: w.chrome.csi().startE
                };
                source = "csi";
            } else if (w.gtbExternal && w.gtbExternal.startE()) {
                // The Google Toolbar exposes navigation start time similar to old versions of chrome
                // This would work for any browser that has the google toolbar installed
                ti = {
                    navigationStart: w.gtbExternal.startE()
                };
                source = 'gtb';
            }

            if (ti) {
                // Always use navigationStart since it falls back to fetchStart (not with redirects)
                // If not set, we leave t_start alone so that timers that depend
                // on it don't get sent back.  Never use requestStart since if
                // the first request fails and the browser retries, it will contain
                // the value for the new request.
                BOOMR.addVar("rt.start", source || "navigation");
                impl.navigationStart = ti.navigationStart || ti.fetchStart || undefined;
                impl.responseStart = ti.responseStart || undefined;

                // bug in Firefox 7 & 8 https://bugzilla.mozilla.org/show_bug.cgi?id=691547
                if (navigator.userAgent.match(/Firefox\/[78]\./)) {
                    impl.navigationStart = ti.unloadEventStart || ti.fetchStart || undefined;
                }
            } else {
                BOOMR.warn("This browser doesn't support the WebTiming API", "rt");
            }

            return;
        },

        page_unload: function (edata) {
            BOOMR.debug("Unload called with " + BOOMR.utils.objectToString(edata), "rt");
            // set cookie for next page
            impl.setCookie(edata.type === 'beforeunload' ? 'ul' : 'hd');
        },

        onclick: function (etarget) {
            if (!etarget) {
                return;
            }
            BOOMR.debug("Click called with " + etarget.nodeName, "rt");
            while (etarget && etarget.nodeName.toUpperCase() !== "A") {
                etarget = etarget.parentNode;
            }
            if (etarget && etarget.nodeName.toUpperCase() === "A") {
                BOOMR.debug("passing through", "rt");
                // user clicked a link, they may be going to another page
                // if this page is being opened in a different tab, then
                // our unload handler won't fire, so we need to set our
                // cookie on click
                impl.setCookie('cl', etarget.href);
            }
        },

        /**
         * Kylie implementation This is the time when DOMContentLoaded event is fired
         */
        domloaded : function () {
            BOOMR.plugins.RT.endTimer('t_domloaded');
        },

        /**
         * Kylie implementation This is the time when onLoad event is fired
         */
        onLoad : function () {
            BOOMR.plugins.RT.endTimer('t_onLoad');
        }
    };

    /**
     * @struct
     * @const
     * @type {!IPlugin}
     */
    var rt = BOOMR.plugins.RT = /** @lends {rt} */ {
        /**
         * @param {?Object.<string, *>=} config
         * @return {!IPlugin}
         */
        init : function (config) {

            BOOMR.debug("init RT", "rt");
            if (w !== BOOMR.window) {
                w = BOOMR.window;
                d = w.document;
            }

            BOOMR.utils.pluginConfig(impl, config, "RT", ["cookie", "cookie_exp", "strict_referrer"]);

            impl.initFromCookie();

            // only initialize once.  we still collect config and read from cookie
            // every time init is called, but we set event handlers only once
            if (impl.initialized) {
                return rt;
            }

            impl.complete = false;
            impl.timers = {};

            BOOMR.subscribe("page_ready", rt.done, null, rt);
            BOOMR.subscribe("dom_loaded", impl.domloaded, null, impl);
            BOOMR.subscribe("page_unload", impl.page_unload, null, impl);
            BOOMR.subscribe("click", impl.onclick, null, impl);
            // Kylie implementation
            // when onLoad is triggered
            BOOMR.subscribe('onLoad', impl.onLoad, null, impl);

            if (BOOMR.t_start) {
                // How long does it take Boomerang to load up and execute (fb to lb)
                rt.startTimer('boomerang', BOOMR.t_start);
                rt.endTimer('boomerang', BOOMR.t_end);    // t_end === null defaults to current time

                // How long did it take from page request to boomerang fb
                rt.endTimer('boomr_fb', BOOMR.t_start);

                if (BOOMR.t_lstart) {
                    // time from before kylie async load
                    rt.endTimer('kylie_ld', BOOMR.t_lstart);
                    // The difference between t_lstart and t_start gives the
                    // time to download
                    rt.setTimer('kylie_lat', BOOMR.t_start - BOOMR.t_lstart, BOOMR.t_lstart);
                }
            }

            // A beacon may be fired automatically on page load or if the page dev fires
            // it manually with their own timers.  It may not always contain a referrer
            // (eg: XHR calls).  We set default values for these cases
            impl.r = impl.r2 = d.referrer.replace(/#.*/, '');

            if (!impl.sessionStart) {
                impl.sessionStart = BOOMR.t_lstart || BOOMR.t_start;
            }

            impl.initialized = true;
            return rt;
        },

        /**
         * @param {string} timer_name
         * @param {?number=} time_value
         */
        startTimer: function (timer_name, time_value) {
            if (timer_name) {
                if (timer_name === 't_page') {
                    rt.endTimer('t_resp', time_value);
                }
                impl.timers[timer_name] = {start: (typeof time_value === "number" ? time_value : new Date().getTime())};
                impl.complete = false;
            }

            return rt;
        },

        /**
         * @param {string} timer_name
         * @param {?number=} time_value
         */
        endTimer: function (timer_name, time_value) {
            if (timer_name) {
                impl.timers[timer_name] = impl.timers[timer_name] || {};
                if (impl.timers[timer_name].end === undefined) {
                    impl.timers[timer_name].end =
                        (typeof time_value === "number" ? time_value : new Date().getTime());
                }
            }

            return rt;
        },

        /**
         * Kylie Implementation
         * @param {string} timer_name
         * @param {!number} time_delta
         * @param {!number} time_start
         * @return {!Object} for chaining methods
         */
        setTimer : function (timer_name, time_delta, time_start) {
            if (timer_name) {
                impl.timers[timer_name] = {
                    delta: time_delta,
                    start: time_start
                };
            }
            return rt;
        },

        /**
         * Kylie Implementation
         * @param {string} old_timer
         * @param {string} new_timer
         */
        updateTimer : function (old_timer, new_timer) {
            if (old_timer) {
                impl.timers[new_timer] = impl.timers[old_timer];
                impl.timers[old_timer] = {};
            }
        },

        /**
         * Kylie implementation This is the time when onLoad is fired
         *
         * @return {!Object} for chaining methods
         */
        clearTimers : function () {
            impl.timers = {};
            return rt;
        },

        /**
         * Kylie implementation This method updates vars with any newly created timers
         */
        updateVars : function () {
            if (impl.timers) {
                var timer, t_name;
                for (t_name in impl.timers) {
                    if (impl.timers.hasOwnProperty(t_name)) {
                        timer = impl.timers[t_name];
                        // only if the timer has been ended
                        if (timer.end && timer.start) {
                            if (typeof timer.delta !== 'number') {
                                timer.delta = timer.end - timer.start;
                            }
                            BOOMR.addVar(t_name, timer.delta);
                        }
                    }
                }
            }
        },

        /**
         * Kylie implementation
         * This method returns the set timers
         * 
         * @return {Object.<!​string, {start: (number|​undefined), end: (number|​undefined)}>​}
         */
        getTimers : function () {
            return impl.timers;
        },

        /**
         * Kylie implementation
         * This method is used to mark the start of a transaction
         *
         * @return {!Object} for chaining methods
         */
        startTransaction : function (tName) {
            return BOOMR.plugins.RT.startTimer('txn_' + tName, new Date().getTime());
        },

        /**
         * Kylie implementation
         * This method is used to mark the end of a transaction
         *
         * @return {!Object} for chaining methods
         */
        endTransaction : function (tName) {
            return BOOMR.plugins.RT.endTimer('txn_' + tName, new Date().getTime());
        },

        /**
         * Kylie implementation
         * This method returns the sessionID passed on by the server
         *
         * @return {!string}
         */
        getSessionID : function () {
            return impl.sessionID;
        },

        /**
         * Kylie implementation
         * This method returns the start of the session
         *
         * @return {number|undefined}
         */
        getSessionStart : function () {
            return impl.sessionStart;
        },

        /**
         * Kylie implementation
         * This method returns if onload has been fired or not
         *
         * @return {!boolean}
         */
        isOnLoadFired : function () {
            return impl.onloadfired;
        },

        /**
         * Called when the page has reached a "usable" state. This may be when
         * the onload event fires, or it could be at some other moment during/after
         * page load when the page is usable by the user
         * 
         * @return {!Object}
         */
        done : function () {
            BOOMR.debug("Called done", "rt");
            var t_start,
                t_done = new Date().getTime(),
                ntimers = 0,
                t_name,
                timer,
                t_other = [];

            impl.complete = false;

            impl.initFromCookie();
            impl.initNavTiming();

            if (impl.checkPreRender()) {
                return rt;
            }

            if (impl.responseStart) {
                // Use NavTiming API to figure out resp latency and page time
                // t_resp will use the cookie if available or fallback to NavTiming
                rt.endTimer("t_resp", impl.responseStart);
                if (impl.timers['t_load']) {
                    rt.setTimer('t_page', impl.timers['t_load'].end - impl.responseStart, impl.responseStart);
                } else {
                    var delta = t_done - impl.responseStart;

                    //Chrome will sometimes report a negative number.
                    if (delta > 0) {
                        rt.setTimer('t_page', delta, impl.responseStart);
                    }
                }
            } else if (impl.timers.hasOwnProperty('t_page')) {
                // If the dev has already started t_page timer, we can end it now as well
                rt.endTimer('t_page');
            } else if (impl.t_fb_approx) {
                rt.endTimer('t_resp', impl.t_fb_approx);
                rt.setTimer("t_page", t_done - impl.t_fb_approx, impl.t_fb_approx);
            }

            // If a prerender timer was started, we can end it now as well
            if (impl.timers.hasOwnProperty('t_postrender')) {
                rt.endTimer('t_postrender');
                rt.endTimer('t_prerender');
            }


            if (impl.navigationStart) {
                t_start = impl.navigationStart;
            } else if (impl.t_start && impl.navigationType !== 2) {
                t_start = impl.t_start;            // 2 is TYPE_BACK_FORWARD but the constant may not be defined across browsers
                BOOMR.addVar("rt.start", "cookie");    // if the user hit the back button, referrer will match, and cookie will match
            } else { // but will have time of previous page start, so t_done will be wrong
                BOOMR.addVar("rt.start", "none");
                t_start = undefined;            // force all timers to NaN state
            }

            if (t_start && impl.sessionStart > t_start) {
                impl.sessionStart = BOOMR.t_lstart || BOOMR.t_start;
                impl.sessionLength = 0;
            }

            // If the dev has already called endTimer, then this call will do nothing
            // else, it will stop the page load timer

            rt.endTimer('t_done', t_done);
            // make sure old variables don't stick around
            BOOMR.removeVar('t_done', 't_page', 't_resp', 'r', 'r2', 'rt.tstart', 'rt.bstart', 'rt.end', 'rt.ss', 'rt.sl', 'rt.lt', 't_postrender', 't_prerender', 't_load');

            BOOMR.addVar('rt.tstart', t_start);
            BOOMR.addVar('rt.bstart', BOOMR.t_start);
            BOOMR.addVar('rt.end', impl.timers['t_done'].end); // don't just use t_done because dev may have called endTimer before we did

            /* Config plugin support */
            if (impl.timers['t_configfb']) {
                if (('t_configfb' in impl.timers && typeof impl.timers['t_configfb'].start != 'number') || isNaN(impl.timers['t_configfb'].start)) {
                    if ('t_configjs' in impl.timers && typeof impl.timers['t_configjs'].start == 'number') {
                        impl.timers['t_configfb'].start = impl.timers['t_configjs'].start;
                    } else {
                        delete impl.timers['t_configfb'];
                    }
                }
            }

            for (t_name in impl.timers) {
                if (impl.timers.hasOwnProperty(t_name)) {
                    timer = impl.timers[t_name];

                    // if delta is a number, then it was set using setTimer
                    // if not, then we have to calculate it using start & end
                    if (typeof timer.delta !== "number") {
                        if (typeof timer.start !== "number") {
                            timer.start = t_start;
                        }
                        timer.delta = timer.end - timer.start;
                    }

                    // If the caller did not set a start time, and if there was no start cookie
                    // Or if there was no end time for this timer,
                    // then timer.delta will be NaN, in which case we discard it.
                    if (isNaN(timer.delta)) {
                        continue;
                    }

                    BOOMR.addVar(t_name, timer.delta);
                    ntimers++;
                }
            }

            if (ntimers) {
                BOOMR.addVar("r", impl.r);

                if (impl.r2 !== impl.r) {
                    BOOMR.addVar("r2", impl.r2);
                }

                if (t_other.length) {
                    BOOMR.addVar("t_other", t_other.join(','));
                }
            }

            BOOMR.addVar({
                'rt.sid' : impl.sessionID,
                'rt.ss' : impl.sessionStart,
                'rt.sl' : impl.sessionLength
            });

            impl.timers = {};
            impl.complete = true;

            BOOMR.sendBeacon(); // we call sendBeacon() anyway because some
                                // other plugin may have blocked waiting 
                                // for RT to complete
            impl.onloadfired = true;
            return rt;
        },

        /**
         * @return {boolean}
         */
        is_complete : function () {
            return impl.complete;
        }
    };
}
runrt(window); // end of RT plugin