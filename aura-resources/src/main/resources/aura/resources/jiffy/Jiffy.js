/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * @license Copyright (c) 2011, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */
// Measure the time the script started
// This has to be global so that we don't wait for the entire
// BOOMR function to download and execute before measuring the
// time.  We also declare it without `var` so that we can later
// `delete` it.  This is the only way that works on Internet Explorer
BOOMR_start = new Date().getTime();

// beaconing section
// the parameter is the window
(function(w) {

    var impl, boomr, k, d = w.document;

    if (typeof BOOMR === 'undefined') {
        BOOMR = {};
    }
    // don't allow this code to be included twice
    if (BOOMR.version) {
        return;
    }

    BOOMR.version = '0.9';

    // impl is a private object not reachable from outside the BOOMR object
    // users can set properties by passing in to the init() method
    impl = {
        // properties
        beacon_url : '/_ui/common/request/servlet/JiffyServlet',
        // strip out everything except last two parts of hostname.
        // This doesn't work well for domains that end with a country tld,
        // but we allow the developer to override site_domain for that.
        site_domain : w.location.hostname.replace(/.*?([^.]+\.[^.]+)\.?$/, '$1').toLowerCase(),
        // ! User's ip address determined on the server. Used for the BA cookie
        user_ip : '',
        onloadfired : false,
        events : {
            'page_ready' : [],
            'page_unload' : [],
            'dom_loaded' : [],
            'onLoad' : [],
            // when onLoad is fired
            'visibility_changed' : [],
            'before_beacon' : []
        },

        vars : {},

        disabled_plugins : {},

        fireEvent : function(e_name, data) {
            var i, h, e;
            if (!this.events.hasOwnProperty(e_name)) {
                return false;
            }

            e = this.events[e_name];

            for (i = 0; i < e.length; i++) {
                h = e[i];
                h[0].call(h[2], data, h[1]);
            }

            return true;
        },

        addListener : function(el, sType, fn) {
            if (el.addEventListener) {
                el.addEventListener(sType, fn, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + sType, fn);
            }
        }
    };

    // We create a boomr object and then copy all its properties to BOOMR so
    // that
    // we don't overwrite anything additional that was added to BOOMR before
    // this
    // was called... for example, a plugin.
    boomr = {
        t_lstart : null,
        t_start : BOOMR_start,
        t_end : null,

        // Utility functions
        utils : {
            getCookie : function(name) {
                if (!name) {
                    return null;
                }

                name = ' ' + name + '=';

                var i, cookies;
                cookies = ' ' + d.cookie + ';';
                if ((i = cookies.indexOf(name)) >= 0) {
                    i += name.length;
                    cookies = cookies.substring(i, cookies.indexOf(';', i));
                    return cookies;
                }

                return null;
            },

            setCookie : function(name, subcookies, max_age) {
                var value = [], k, nameval, c, exp;

                if (!name) {
                    return false;
                }

                for (k in subcookies) {
                    if (subcookies.hasOwnProperty(k)) {
                        value.push(encodeURIComponent(k) + '=' + encodeURIComponent(subcookies[k]));
                    }
                }

                value = value.join('&');

                nameval = name + '=' + value;

                c = [
                        nameval, 'path=/', 'domain=' + impl.site_domain
                ];
                if (max_age) {
                    exp = new Date();
                    exp.setTime(exp.getTime() + max_age * 1000);
                    exp = exp.toGMTString();
                    c.push('expires=' + exp);
                }

                if (nameval.length < 4000) {
                    d.cookie = c.join('; ');
                    // confirm cookie was set (could be blocked by user's
                    // settings, etc.)
                    return (value === this.getCookie(name));
                }

                return false;
            },

            getSubCookies : function(cookie) {
                var cookies_a, i, l, kv, cookies = {};

                if (!cookie) {
                    return null;
                }

                cookies_a = cookie.split('&');

                if (cookies_a.length === 0) {
                    return null;
                }

                for (i = 0, l = cookies_a.length; i < l; i++) {
                    kv = cookies_a[i].split('=');
                    kv.push(''); // just in case there's no value
                    cookies[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
                }

                return cookies;
            },

            removeCookie : function(name) {
                return this.setCookie(name, {}, 0);
            },

            pluginConfig : function(o, config, plugin_name, properties) {
                var i, props = 0;

                if (!config || !config[plugin_name]) {
                    return false;
                }

                for (i = 0; i < properties.length; i++) {
                    if (typeof config[plugin_name][properties[i]] !== 'undefined') {
                        o[properties[i]] = config[plugin_name][properties[i]];
                        props++;
                    }
                }

                return (props > 0);
            }
        },
        // Changed Implementation
        init : function(config) {

            var i, k, properties = [
                    'beacon_url', 'site_domain', 'user_ip'
            ];

            if (!config) {
                config = {};
            }

            for (i = 0; i < properties.length; i++) {
                if (typeof config[properties[i]] !== 'undefined') {
                    impl[properties[i]] = config[properties[i]];
                }
            }

            if (typeof config.log !== 'undefined') {
                this.log = config.log;
            }
            if (!this.log) {
                this.log = function(m, l, s) {
                };
            }

            for (k in this.plugins) {
                // config[pugin].enabled has been set to false
                if (config[k] && ('enabled' in config[k]) && config[k].enabled === false) {
                    impl.disabled_plugins[k] = 1;
                    continue;
                } else if (impl.disabled_plugins[k]) {
                    delete impl.disabled_plugins[k];
                }

                // plugin exists and has an init method
                if (this.plugins.hasOwnProperty(k) && typeof this.plugins[k].init === 'function') {
                    this.plugins[k].init(config);
                }
            }

            // The developer can override onload by setting autorun to false
            if (!impl.onloadfired && (!('autorun' in config) || config.autorun !== false)) {
                if ('onpagehide' in w) {
                    impl.addListener(w, 'pageshow', BOOMR.page_ready);
                } else {
                    impl.addListener(w, 'load', BOOMR.page_ready);
                }
            }

            impl.addListener(w, 'DOMContentLoaded', function() {
                impl.fireEvent('dom_loaded');
            });

            impl.addListener(w, 'load', function() {
                impl.fireEvent('onLoad');
            });

            // visibilitychange is useful to detect if the page loaded through
            // prerender
            // or if the page never became visible
            // http://www.w3.org/TR/2011/WD-page-visibility-20110602/
            // http://www.nczonline.net/blog/2011/08/09/introduction-to-the-page-visibility-api/
            var fire_visible = function() {
                impl.fireEvent('visibility_changed');
            };
            if (d.webkitVisibilityState)
                impl.addListener(d, 'webkitvisibilitychange', fire_visible);
            else if (d.msVisibilityState)
                impl.addListener(d, 'msvisibilitychange', fire_visible);
            else if (d.visibilityState)
                impl.addListener(d, 'visibilitychange', fire_visible);

            if (!('onpagehide' in w)) {
                // This must be the last one to fire
                // We only clear w on browsers that don't support onpagehide
                // because
                // those that do are new enough to not have memory leak problems
                // of
                // some older browsers
                impl.addListener(w, 'unload', function() {
                    w = null;
                });
            }

            return this;
        },

        // The page dev calls this method when they determine the page is
        // usable.
        // Only call this if autorun is explicitly set to false
        /**
         * @expose
         */
        page_ready : function() {
            if (impl.onloadfired) {
                return this;
            }
            impl.fireEvent('page_ready');
            impl.onloadfired = true;
            return this;
        },

        subscribe : function(d, n, j, p) {
            var k, m, o;
            if (!impl.events.hasOwnProperty(d)) {
                return this;
            }
            o = impl.events[d];
            for (k = 0; k < o.length; k++) {
                m = o[k];
                if (m[0] === n && m[1] === j && m[2] === p) {
                    return this;
                }
            }
            o.push([
                    n, j || {}, p || null
            ]);

            // This is for plugins subscribed after onLoad is fired..like
            // plugins enabled by config..like navtiming and mem
            if (d == 'page_ready' && impl.onloadfired) {
                setTimeout(function() {
                    n.call(p || null, null, j || {});
                }, 50);
            }
            if (d === 'page_unload') {
                var l = function() {
                    if (n) {
                        n.call(p, null, j);
                    }
                    n = p = j = null;
                };
                if ('onpagehide' in w) {
                    impl.addListener(w, 'pagehide', l);
                } else {
                    impl.addListener(w, 'unload', l);
                    impl.addListener(w, 'beforeunload', l);
                }
            }
            return this;
        },

        addVar : function(name, value) {
            if (typeof name === 'string') {
                impl.vars[name] = value;
            } else if (typeof name === 'object') {
                var o = name, k;
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        impl.vars[k] = o[k];
                    }
                }
            }
            return this;
        },

        /**
         * SFDC implementation This method returns an array of timers
         *
         * @return {Object.<string, !string|number>}
         */
        getVars : function() {
            return impl.vars;
        },

        /**
         * SFDC implementation This method return a particular timer
         *
         * @param {!string} name
         * @return {!string|number}
         */
        getVar : function(name) {
            return impl.vars[name];
        },

        removeVar : function() {
            var i, params;
            if (!arguments.length) {
                return this;
            }

            if (arguments.length === 1 && Object.prototype.toString.apply(arguments[0]) === '[object Array]') {
                params = arguments[0];
            } else {
                params = arguments;
            }

            for (i = 0; i < params.length; i++) {
                if (impl.vars.hasOwnProperty(params[i])) {
                    delete impl.vars[params[i]];
                }
            }

            return this;
        },

        /**
         * SFDC implementation This is to clear all stats after they are beaconed out by piggybacking on Lumen requests
         *
         * @return {?} for chaining methods
         * @this {?}
         * @expose
         */
        removeStats : function() {
            impl.vars = {};
            BOOMR.plugins.RT.clearTimers();
            return this;
        },

        sendBeacon : function() {
            var k, url, img, nparams = 0;

            // At this point someone is ready to send the beacon. We send
            // the beacon only if all plugins have finished doing what they
            // wanted to do
            for (k in this.plugins) {
                if (this.plugins.hasOwnProperty(k)) {
                    if (impl.disabled_plugins[k]) {
                        continue;
                    }
                    if (!this.plugins[k].is_complete()) {
                        return this;
                    }
                }
            }

            // If we reach here, all plugins have completed
            impl.fireEvent('before_beacon', impl.vars);

            // Don't send a beacon if no beacon_url has been set
            if (!impl.beacon_url) {
                return this;
            }

            // if there are already url parameters in the beacon url,
            // change the first parameter prefix for the boomerang url
            // parameters to &
            url = impl.beacon_url + ((impl.beacon_url.indexOf('?') > -1) ? '&' : '?') + 'v=' + encodeURIComponent(BOOMR.version) + '&u=' + encodeURIComponent(d.URL.replace(/#.*/, ''));

            // use d.URL instead of location.href because of a safari bug
            for (k in impl.vars) {
                if (impl.vars.hasOwnProperty(k)) {
                    nparams++;
                    url += '&' + encodeURIComponent(k) + '=' + (impl.vars[k] === undefined || impl.vars[k] === null ? '' : encodeURIComponent(impl.vars[k]));
                }
            }

            BOOMR.removeVar('qt');

            // only send beacon if we actually have something to beacon back
            if (nparams) {
                img = new Image();
                img.src = url;
            }

            return this;
        },
        
        /**
         * SFDC implementation This is to re-init the beacon_url 
         * (used on unauthenticated pages)
         * 
         * @param {!string} url The URL to use for beaconing data
         * @private
         */
        setBeaconUrl : function(url) {
        	impl["beacon_url"] = url;
        }

    };

    delete BOOMR_start;
    // SFDC implementation
    if (typeof BOOMR_lstart == 'number') {
        boomr.t_lstart = BOOMR_lstart;
        delete BOOMR_lstart;
    }
    var make_logger = function(l) {
        return function(m, s) {
            this.log(m, l, 'boomerang' + (s ? '.' + s : ''));
            return this;
        };
    };

    boomr.debug = make_logger('debug');
    boomr.info = make_logger('info');
    boomr.warn = make_logger('warn');
    boomr.error = make_logger('error');

    if (typeof console !== 'undefined' && typeof console.log !== 'undefined') {
        boomr.log = function(m, l, s) {
            console.log(s + ': [' + l + '] ' + m);
        };
    }

    for (k in boomr) {
        if (boomr.hasOwnProperty(k)) {
            BOOMR[k] = boomr[k];
        }
    }

    BOOMR.plugins = BOOMR.plugins || {};

}(window));

// end of boomerang beaconing section
// Now we start built in plugins.

// This is the Round Trip Time plugin. Abbreviated to RT
// the parameter is the window
(function(w) {

    var d = w.document;

    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    // private object
    var impl = {
        onloadfired : false,
        visiblefired : false,
        complete : false,
        // ! Set when this plugin has completed
        timers : {},
        // ! Custom timers that the developer can use
        // Format for each timer is { start: XXX, end: YYY, delta: YYY-XXX }
        cookie : 'RT',
        // ! Name of the cookie that stores the start time and referrer
        cookie_exp : 1800,
        // ! Cookie expiry in seconds
        strict_referrer : false,
        // ! By default, don't beacon if referrers don't match.
        // If set to false, beacon both referrer values and let
        // the back end decide
        navigationType : 0,
        navigationStart : undefined,
        responseStart : undefined,
        sessionID : Math.floor(Math.random() * 4294967296).toString(36),
        sessionStart : undefined,
        sessionLength : 0,
        t_start : undefined,
        r : undefined,
        r2 : undefined,

        // The start method is fired on page unload. It is called with the scope
        // of the BOOMR.plugins.RT object
        setCookie : function() {
            var t_end, t_start = new Date().getTime();

            // Disable use of RT cookie by setting its name to a falsy value
            if (!this.cookie) {
                return this;
            }

            // We use document.URL instead of location.href because of a bug in
            // safari 4
            // where location.href is URL decoded

            if (!BOOMR.utils.setCookie(this.cookie, {
                s : t_start,
                r : d.URL.replace(/#.*/, ''),
                si : this.sessionID,
                ss : this.sessionStart,
                sl : this.sessionLength
            }, this.cookie_exp)) {
                BOOMR.error('cannot set start cookie', 'rt');
                return this;
            }

            t_end = new Date().getTime();
            if (t_end - t_start > 50) {
                // It took > 50ms to set the cookie
                // The user most likely has cookie prompting turned on so
                // t_start won't be the actual unload time
                // We bail at this point since we can't reliably tell t_done
                BOOMR.utils.removeCookie(this.cookie);

                // at some point we may want to log this info on the server side
                BOOMR.error('took more than 50ms to set cookie... aborting: ' + t_start + ' -> ' + t_end, 'rt');
            }

            return this;
        },
        initFromCookie : function(flag) {
            var subcookies;
            if (!this.cookie) {
                return;
            }
            subcookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(this.cookie));
            if (!subcookies) {
                return;
            }

            if (flag && subcookies.s && subcookies.r) {
                this.r = subcookies.r;
                if (!this.strict_referrer || this.r === this.r2) {
                    this.t_start = parseInt(subcookies.s, 10);
                }
            }

            if (subcookies.si) {
                this.sessionID = subcookies.si;
            }
            if (subcookies.ss) {
                this.sessionStart = parseInt(subcookies.ss, 10);
            }
            if (subcookies.sl) {
                this.sessionLength = parseInt(subcookies.sl, 10);
            }
        },
        page_ready : function() {
            this.onloadfired = true;
        },
        visibility_changed : function() {
            if (!(c.hidden || c.msHidden || c.webkitHidden)) {
                b.visiblefired = true;
            }
        },
        checkPreRender : function() {
            if (!(c.webkitVisibilityState && c.webkitVisibilityState === 'prerender') && !(c.msVisibilityState && c.msVisibilityState === 3)) {
                return false;
            }
            BOOMR.plugins.RT.startTimer('t_load', this.navigationStart);
            BOOMR.plugins.RT.endTimer('t_load');
            BOOMR.plugins.RT.startTimer('t_prerender', this.navigationStart);
            BOOMR.plugins.RT.startTimer('t_postrender');
            BOOMR.subscribe('visibility_changed', BOOMR.plugins.RT.done, 'visible', BOOMR.plugins.RT);
            return true;
        },
        initNavTiming : function() {
            var ti, p, source;

            if (this.navigationStart) {
                return;
            }

            // Get start time from WebTiming API see:
            // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
            // http://blogs.msdn.com/b/ie/archive/2010/06/28/measuring-web-page-performance.aspx
            // http://blog.chromium.org/2010/07/do-you-know-how-slow-your-web-page-is.html
            p = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;

            if (p && p.navigation) {
                this.navigationType = p.navigation.type;
            }

            if (p && p.timing) {
                ti = p.timing;
            } else if (w.chrome && w.chrome.csi && w.chrome.csi().startE) {
                // Older versions of chrome also have a timing API that's sort
                // of documented here:
                // http://ecmanaut.blogspot.com/2010/06/google-bom-feature-ms-since-pageload.html
                // source here:
                // http://src.chromium.org/viewvc/chrome/trunk/src/chrome/renderer/loadtimes_extension_bindings.cc?view=markup
                ti = {
                    navigationStart : w.chrome.csi().startE

                };
                source = 'csi';
            } else if (w.gtbExternal && w.gtbExternal.startE()) {
                // The Google Toolbar exposes navigation start time similar to
                // old versions of chrome
                // This would work for any browser that has the google toolbar
                // installed
                ti = {
                    navigationStart : w.gtbExternal.startE()
                };
                source = 'gtb';
            }

            if (ti) {
                // Always use navigationStart since it falls back to fetchStart
                // (not with redirects)
                // If not set, we leave t_start alone so that timers that depend
                // on it don't get sent back. Never use requestStart since if
                // the first request fails and the browser retries, it will
                // contain
                // the value for the new request.
                BOOMR.addVar('rt.start', source || 'navigation');
                this.navigationStart = ti.navigationStart || ti.fetchStart || undefined;
                this.responseStart = ti.responseStart || undefined;

                // bug in Firefox 7 & 8
                // https://bugzilla.mozilla.org/show_bug.cgi?id=691547
                if (navigator.userAgent.match(/Firefox\/[78]\./)) {
                    this.navigationStart = ti.unloadEventStart || ti.fetchStart || undefined;
                }
            } else {
                BOOMR.warn("This browser doesn't support the WebTiming API", 'rt');
            }

            return;
        },
        page_unload : function(d) {
            BOOMR.plugins.RT.done(d, 'unload');
            this.setCookie();
        },
        /**
         * SFDC implementation This is the time when DOMContentLoaded event is fired
         */
        domloaded : function() {
            BOOMR.plugins.RT.endTimer('t_domloaded');
        },

        /**
         * SFDC implementation This is the time when onLoad event is fired
         */
        onLoad : function() {
            BOOMR.plugins.RT.endTimer('t_onLoad');
        }
    };

    BOOMR.plugins.RT = {
        // Methods
        // Changed implementation
        init : function(config) {

            BOOMR.utils.pluginConfig(impl, config, 'RT', [
                    'cookie', 'cookie_exp', 'strict_referrer'
            ]);
            if (impl.onloadfired || impl.complete) {
                return this;
            }
            impl.complete = false;
            impl.timers = {};

            BOOMR.subscribe('page_ready', impl.page_ready, null, impl);
            impl.visiblefired = !(d.hidden || d.msHidden || d.webkitHidden);
            if (!impl.visiblefired) {
                BOOMR.subscribe('visibility_changed', impl.visibility_changed, null, impl);
            }
            BOOMR.subscribe('page_ready', this.done, 'load', this);
            BOOMR.subscribe('dom_loaded', impl.domloaded, null, impl);
            // SFDC implementation
            // when onLoad is triggered
            BOOMR.subscribe('onLoad', impl.onLoad, null, impl);
            BOOMR.subscribe('page_unload', impl.page_unload, null, impl);

            if (BOOMR.t_start) {
                // How long does it take Jiffy to parse and execute
                this.startTimer('jiffy', BOOMR.t_start);
                this.endTimer('jiffy', BOOMR.t_end); // t_end === null
                // defaults to current
                // time
                // time until the first byte of response
                // How long did it take till Jiffy started, first byte
                this.endTimer('jiffy_fb', BOOMR.t_start);

                if (BOOMR.t_lstart) {
                    // time from before Jiffy async load
                    this.endTimer('jiffy_ld', BOOMR.t_lstart);
                    // The difference between t_lstart and t_start gives the
                    // time to download
                    this.setTimer('jiffy_lat', BOOMR.t_start - BOOMR.t_lstart, BOOMR.t_lstart);
                }
            }
            impl.r = impl.r2 = d.referrer.replace(/#.*/, '');
            impl.initFromCookie(true);
            if (!impl.sessionStart) {
                impl.sessionStart = BOOMR.t_lstart || BOOMR.t_start;
            }

            return this;
        },

        startTimer : function(timer_name, time_value) {

            if (timer_name) {
                if (timer_name === 't_page') {
                    this.endTimer('t_resp', time_value);
                }
                impl.timers[timer_name] = {
                    start : (typeof time_value === 'number' ? time_value : new Date().getTime())
                };
                impl.complete = false;
            }

            return this;
        },

        endTimer : function(timer_name, time_value) {

            if (timer_name) {

                impl.timers[timer_name] = impl.timers[timer_name] || {};

                if (!('end' in impl.timers[timer_name])) {
                    impl.timers[timer_name].end = (typeof time_value === 'number' ? time_value : new Date().getTime());

                }
            }

            return this;
        },

        /**
         * SFDC Implementation
         * @param {String} timer_name
         * @param {!Number} time_delta
         * @param {!Number=} time_start
         * @return {!Object} for chaining methods
         */
        setTimer : function(timer_name, time_delta, time_start) {
            if (timer_name) {
                impl.timers[timer_name] = {
                    delta : time_delta,
                    start : time_start
                };
            }
            return this;
        },

        /**
         * SFDC Implementation
         * @param {string} old_timer
         * @param {string} new_timer
         */
        updateTimer : function(old_timer, new_timer) {
            if (old_timer) {
                impl.timers[new_timer] = impl.timers[old_timer];
                impl.timers[old_timer] = {};
            }
        },

        /**
         * SFDC implementation This is the time when onLoad is fired
         *
         * @return {!Object} for chaining methods
         * @this {Object}
         */
        clearTimers : function() {
            impl.timers = {};
            return this;
        },

        /**
         * SFDC implementation This method updates vars with any newly created timers
         */
        updateVars : function() {
            if (impl.timers) {
                var timer, t_name;
                for (t_name in impl.timers) {
                    if (impl.timers.hasOwnProperty(t_name)) {
                        timer = impl.timers[t_name];
                        // only if the timer has been ended
                        if(timer.end && timer.start) {
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
         * SFDC implementation This method returns the set timers
         * @return {Object.<!​String, {start: (number|​undefined), end: (number|​undefined)}>​}
         */
        getTimers : function() {
            return impl.timers;
        },

        /**
         * SFDC implementation This method is used to mark the start of a transaction
         *
         * @return {!Object} for chaining methods
         * @this {Object}
         */
        startTransaction : function(tName) {
            BOOMR.plugins.RT.startTimer('txn_' + tName, new Date().getTime());
            return this;
        },

        /**
         * SFDC implementation This method is used to mark the end of a transaction
         *
         * @return {!Object} for chaining methods
         * @this {Object}
         */
        endTransaction : function(tName) {
            BOOMR.plugins.RT.endTimer('txn_' + tName, new Date().getTime());
            return this;
        },

        /**
         * SFDC implementation This method returns the sessionID passed on by the server
         *
         * @return {!string}
         * @expose
         */
        getSessionID : function() {
            return impl.sessionID;
        },

        /**
         * SFDC implementation This method returns the start of the session
         *
         * @return {number}
         */
        getSessionStart : function() {
            return impl.sessionStart;
        },

        /**
         * SFDC implementation This method returns if onload has been fired or not
         *
         * @return {!boolean}
         */
        onLoadFired : function() {
            return impl.onloadfired;
        },

        // Called when the page has reached a "usable" state. This may be when
        // the
        // onload event fires, or it could be at some other moment during/after
        // page
        // load when the page is usable by the user
        // Changed implementation
        /** @expose */
        done : function(j, h) {
            var g, k = new Date().getTime(), subcookies, basic_timers = {
                't_done' : 1,
                't_resp' : 1,
                't_page' : 1,
                't_domloaded' : 1,
                't_onLoad' : 1,
                'PageStart' : 1,
                'pagePerceived' : 1
            }, ntimers = 0, t_name, timer, t_other = [];

            impl.complete = false;

            if (h == 'load' || h == 'visible') {
                impl.initNavTiming();
                // TODO: Check this
                /*
                 * if (impl.checkPreRender()) { return this }
                 */
                if (impl.responseStart) {
                    this.endTimer('t_resp', impl.responseStart);
                    if (impl.timers['t_load']) {
                        this.setTimer('t_page', impl.timers['t_load'].end - impl.responseStart, impl.responseStart);
                    } else {
                        var delta = k - impl.responseStart;

                        //Chrome will sometimes report a negative number.
                        if(delta > 0) {
                            this.setTimer('t_page', delta, impl.responseStart);
                        } else if(impl.timers.hasOwnProperty('t_page')) {
                            this.endTimer('t_page');
                        }
                    }
                } else if (impl.timers.hasOwnProperty('t_page')) {

                    this.endTimer('t_page');
                }
                if (impl.timers.hasOwnProperty('t_postrender')) {
                    this.endTimer('t_postrender');
                    this.endTimer('t_prerender');
                }
            }

            if (impl.navigationStart) {
                g = impl.navigationStart;
            } else {
                if (impl.t_start && impl.navigationType !== 2) {
                    g = impl.t_start;
                    BOOMR.addVar('rt.start', 'cookie');
                    this.setTimer('t_page', k - BOOMR.t_start, BOOMR.t_start);
                }
            }

            impl.initFromCookie(false);
            if (g && impl.sessionStart > g) {
                impl.sessionStart = BOOMR.t_lstart || BOOMR.t_start;
                impl.sessionLength = 0;
            }

            this.endTimer('t_done', k);
            // make sure old variables don't stick around
            BOOMR.removeVar('t_done', 't_page', 't_resp', 'r', 'r2', 'rt.tstart', 'rt.bstart', 'rt.end', 'rt.ss', 'rt.sl', 'rt.lt', 't_postrender', 't_prerender', 't_load');

            BOOMR.addVar('rt.tstart', g);
            BOOMR.addVar('rt.bstart', BOOMR.t_start);
            BOOMR.addVar('rt.end', impl.timers['t_done'].end);

            /* Config plugin support */
            if (impl.timers['t_configfb']) {
                if ('t_configfb' in impl.timers && typeof impl.timers['t_configfb'].start != 'number' || isNaN(impl.timers['t_configfb'].start)) {
                    if ('t_configjs' in impl.timers && typeof impl.timers['t_configjs'].start == 'number') {
                        impl.timers['t_configfb'].start = impl.timers['t_configjs'].start;
                    } else {
                        delete impl.timers['t_configfb'];
                    }
                }
            }

            for (t_name in impl.timers) {

                if (!impl.timers.hasOwnProperty(t_name)) {
                    continue;
                }
                timer = impl.timers[t_name];

                // if delta is a number, then it was set using setTimer
                // if not, then we have to calculate it using start & end
                if (typeof timer.delta !== 'number') {
                    if (typeof timer.start !== 'number') {
                        timer.start = g;
                    }
                    timer.delta = timer.end - timer.start;
                }

                // If the caller did not set a start time, and if there was no
                // start cookie
                // then timer.delta will be NaN, in which case we discard it.
                if (isNaN(timer.delta)) {
                    continue;
                }

                BOOMR.addVar(t_name, timer.delta);
                ntimers++;
            }

            if (ntimers) {
                if (h != 'xhr') {
                    BOOMR.addVar('r', impl.r);
                    if (impl.r2 !== impl.r) {
                        BOOMR.addVar('r2', impl.r2);
                    }
                }
                if (t_other.length) {
                    BOOMR.addVar('t_other', t_other.join(','));
                }
            }

            BOOMR.addVar({
                'rt.si' : impl.sessionID,
                'rt.ss' : impl.sessionStart,
                'rt.sl' : impl.sessionLength
            });

            impl.complete = true;

            BOOMR.sendBeacon(); // we call sendBeacon() anyway because some
            // other plugin
            // may have blocked waiting for RT to complete
            return this;
        },

        is_complete : function() {
            return impl.complete;
        }

    };

}(window)); // end of RT plugin

// This is the Bandwidth & Latency plugin abbreviated to BW
// the parameter is the window
(function(w) {

    var d = w.document;

    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    // We choose image sizes so that we can narrow down on a bandwidth range as
    // soon as possible the sizes chosen correspond to bandwidth values of
    // 14-64kbps, 64-256kbps, 256-1024kbps, 1-2Mbps, 2-8Mbps, 8-30Mbps & 30Mbps+
    // Anything below 14kbps will probably timeout before the test completes
    // Anything over 60Mbps will probably be unreliable since latency will make
    // up
    // the largest part of download time. If you want to extend this further to
    // cover 100Mbps & 1Gbps networks, use image sizes of 19,200,000 &
    // 153,600,000
    // bytes respectively
    // See
    // https://spreadsheets.google.com/ccc?key=0AplxPyCzmQi6dDRBN2JEd190N1hhV1N5cHQtUVdBMUE&hl=en_GB
    // for a spreadsheet with the details
    var images = [
            {
                name : 'image-0.png',
                size : 11483,
                timeout : 1400
            }, {
                name : 'image-1.png',
                size : 40658,
                timeout : 1200
            }, {
                name : 'image-2.png',
                size : 164897,
                timeout : 1300
            }, {
                name : 'image-3.png',
                size : 381756,
                timeout : 1500
            }, {
                name : 'image-4.png',
                size : 1234664,
                timeout : 1200
            }, {
                name : 'image-5.png',
                size : 4509613,
                timeout : 1200
            }, {
                name : 'image-6.png',
                size : 9084559,
                timeout : 1200
            }
    ];

    images.end = images.length;
    images.start = 0;

    // abuse arrays to do the latency test simply because it avoids a bunch of
    // branches in the rest of the code.
    // I'm sorry Douglas
    images.l = {
        name : 'image-l.gif',
        size : 35,
        timeout : 1000
    };

    // private object
    var impl = {
        // properties
        base_url : '',
        timeout : 15000,
        nruns : 5,
        latency_runs : 10,
        user_ip : '',
        cookie_exp : 7 * 86400,
        cookie : 'BA',

        // state
        results : [],
        latencies : [],
        latency : null,
        runs_left : 0,
        aborted : false,
        complete : false,
        running : false,

        // methods
        // numeric comparator. Returns negative number if a < b, positive if a >
        // b and 0 if they're equal
        // used to sort an array numerically
        ncmp : function(a, b) {
            return (a - b);
        },

        // Calculate the interquartile range of an array of data points
        iqr : function(a) {
            var l = a.length - 1, q1, q3, fw, b = [], i;

            q1 = (a[Math.floor(l * 0.25)] + a[Math.ceil(l * 0.25)]) / 2;
            q3 = (a[Math.floor(l * 0.75)] + a[Math.ceil(l * 0.75)]) / 2;

            fw = (q3 - q1) * 1.5;

            l++;

            for (i = 0; i < l && a[i] < q3 + fw; i++) {
                if (a[i] > q1 - fw) {
                    b.push(a[i]);
                }
            }

            return b;
        },

        calc_latency : function() {
            var i, n, sum = 0, sumsq = 0, amean, median, std_dev, std_err, lat_filtered;

            // We first do IQR filtering and use the resulting data set
            // for all calculations
            lat_filtered = this.iqr(this.latencies.sort(this.ncmp));
            n = lat_filtered.length;

            BOOMR.debug(lat_filtered, 'bw');

            // First we get the arithmetic mean, standard deviation and standard
            // error
            // We ignore the first since it paid the price of DNS lookup, TCP
            // connect
            // and slow start
            for (i = 1; i < n; i++) {
                sum += lat_filtered[i];
                sumsq += lat_filtered[i] * lat_filtered[i];
            }

            n--; // Since we started the loop with 1 and not 0
            amean = Math.round(sum / n);

            std_dev = Math.sqrt(sumsq / n - sum * sum / (n * n));

            // See http://en.wikipedia.org/wiki/1.96 and
            // http://en.wikipedia.org/wiki/Standard_error_%28statistics%29
            std_err = (1.96 * std_dev / Math.sqrt(n)).toFixed(2);

            std_dev = std_dev.toFixed(2);

            n = lat_filtered.length - 1;

            median = Math.round((lat_filtered[Math.floor(n / 2)] + lat_filtered[Math.ceil(n / 2)]) / 2);

            return {
                mean : amean,
                median : median,
                stddev : std_dev,
                stderr : std_err
            };
        },

        calc_bw : function() {
            var i, j, n = 0, r, bandwidths = [], bandwidths_corrected = [], sum = 0, sumsq = 0, sum_corrected = 0, sumsq_corrected = 0, amean, std_dev, std_err, median, amean_corrected, std_dev_corrected, std_err_corrected, median_corrected, nimgs, bw, bw_c, debug_info = [];

            for (i = 0; i < this.nruns; i++) {
                if (!this.results[i] || !this.results[i].r) {
                    continue;
                }

                r = this.results[i].r;

                // the next loop we iterate through backwards and only consider
                // the largest
                // 3 images that succeeded that way we don't consider small
                // images that
                // downloaded fast without really saturating the network
                nimgs = 0;
                for (j = r.length - 1; j >= 0 && nimgs < 3; j--) {
                    // if we hit an undefined image time, we skipped everything
                    // before this
                    if (!r[j]) {
                        break;
                    }
                    if (r[j].t === null) {
                        continue;
                    }

                    n++;
                    nimgs++;

                    // multiply by 1000 since t is in milliseconds and not
                    // seconds
                    bw = images[j].size * 1000 / r[j].t;
                    bandwidths.push(bw);

                    bw_c = images[j].size * 1000 / (r[j].t - this.latency.mean);
                    bandwidths_corrected.push(bw_c);

                    if (r[j].t < this.latency.mean) {
                        debug_info.push('' + j + '_' + r[j].t);
                    }
                }
            }

            BOOMR.debug('got ' + n + ' readings', 'bw');

            BOOMR.debug('bandwidths: ' + bandwidths, 'bw');
            BOOMR.debug('corrected: ' + bandwidths_corrected, 'bw');

            // First do IQR filtering since we use the median here
            // and should use the stddev after filtering.
            if (bandwidths.length > 3) {
                bandwidths = this.iqr(bandwidths.sort(this.ncmp));
                bandwidths_corrected = this.iqr(bandwidths_corrected.sort(this.ncmp));
            } else {
                bandwidths = bandwidths.sort(this.ncmp);
                bandwidths_corrected = bandwidths_corrected.sort(this.ncmp);
            }

            BOOMR.debug('after iqr: ' + bandwidths, 'bw');
            BOOMR.debug('corrected: ' + bandwidths_corrected, 'bw');

            // Now get the mean & median.
            // Also get corrected values that eliminate latency
            n = Math.max(bandwidths.length, bandwidths_corrected.length);
            for (i = 0; i < n; i++) {
                if (i < bandwidths.length) {
                    sum += bandwidths[i];
                    sumsq += Math.pow(bandwidths[i], 2);
                }
                if (i < bandwidths_corrected.length) {
                    sum_corrected += bandwidths_corrected[i];
                    sumsq_corrected += Math.pow(bandwidths_corrected[i], 2);
                }
            }

            n = bandwidths.length;
            amean = Math.round(sum / n);
            std_dev = Math.sqrt(sumsq / n - Math.pow(sum / n, 2));
            std_err = Math.round(1.96 * std_dev / Math.sqrt(n));
            std_dev = Math.round(std_dev);

            n = bandwidths.length - 1;
            median = Math.round((bandwidths[Math.floor(n / 2)] + bandwidths[Math.ceil(n / 2)]) / 2);

            n = bandwidths_corrected.length;
            amean_corrected = Math.round(sum_corrected / n);
            std_dev_corrected = Math.sqrt(sumsq_corrected / n - Math.pow(sum_corrected / n, 2));
            std_err_corrected = (1.96 * std_dev_corrected / Math.sqrt(n)).toFixed(2);
            std_dev_corrected = std_dev_corrected.toFixed(2);

            n = bandwidths_corrected.length - 1;
            median_corrected = Math.round((bandwidths_corrected[Math.floor(n / 2)] + bandwidths_corrected[Math.ceil(n / 2)]) / 2);

            BOOMR.debug('amean: ' + amean + ', median: ' + median, 'bw');
            BOOMR.debug('corrected amean: ' + amean_corrected + ', ' + 'median: ' + median_corrected, 'bw');

            return {
                mean : amean,
                stddev : std_dev,
                stderr : std_err,
                median : median,
                mean_corrected : amean_corrected,
                stddev_corrected : std_dev_corrected,
                stderr_corrected : std_err_corrected,
                median_corrected : median_corrected,
                debug_info : debug_info
            };
        },

        defer : function(method) {
            var that = this;
            return setTimeout(function() {
                method.call(that);
                that = null;
            }, 10);
        },

        load_img : function(i, run, callback) {
            var url = this.base_url + images[i].name + '?t=' + (new Date().getTime()) + Math.random(),
            // Math.random() is slow, but we get it before we start the timer
            timer = 0, tstart = 0, img = new Image(), that = this;

            img.onload = function() {
                img.onload = img.onerror = null;
                img = null;
                clearTimeout(timer);
                if (callback) {
                    callback.call(that, i, tstart, run, true);
                }
                that = callback = null;
            };
            img.onerror = function() {
                img.onload = img.onerror = null;
                img = null;
                clearTimeout(timer);
                if (callback) {
                    callback.call(that, i, tstart, run, false);
                }
                that = callback = null;
            };

            // the timeout does not abort download of the current image, it just
            // sets an
            // end of loop flag so we don't attempt download of the next image
            // we still
            // need to wait until onload or onerror fire to be sure that the
            // image
            // download isn't using up bandwidth. This also saves us if the
            // timeout
            // happens on the first image. If it didn't, we'd have nothing to
            // measure.
            timer = setTimeout(function() {
                if (callback) {
                    callback.call(that, i, tstart, run, null);
                }
            }, images[i].timeout + Math.min(400, this.latency ? this.latency.mean : 400));

            tstart = new Date().getTime();
            img.src = url;
        },

        lat_loaded : function(i, tstart, run, success) {
            if (run !== this.latency_runs + 1) {
                return;
            }

            if (success !== null) {
                var lat = new Date().getTime() - tstart;
                this.latencies.push(lat);
            }
            // we've got all the latency images at this point,
            // so we can calculate latency
            if (this.latency_runs === 0) {
                this.latency = this.calc_latency();
            }

            this.defer(this.iterate);
        },

        img_loaded : function(i, tstart, run, success) {
            if (run !== this.runs_left + 1) {
                return;
            }

            if (this.results[this.nruns - run].r[i]) { // already called on
                // this image
                return;
            }

            // if timeout, then we set the next image to the end of loop marker
            if (success === null) {
                this.results[this.nruns - run].r[i + 1] = {
                    t : null,
                    state : null,
                    run : run
                };
                return;
            }

            var result = {
                start : tstart,
                end : new Date().getTime(),
                t : null,
                state : success,
                run : run
            };
            if (success) {
                result.t = result.end - result.start;
            }
            this.results[this.nruns - run].r[i] = result;

            // we terminate if an image timed out because that means the
            // connection is
            // too slow to go to the next image
            if (i >= images.end - 1 || typeof this.results[this.nruns - run].r[i + 1] !== 'undefined') {
                BOOMR.debug(this.results[this.nruns - run], 'bw');
                // First run is a pilot test to decide what the largest image
                // that we can download is. All following runs only try to
                // download this image
                if (run === this.nruns) {
                    images.start = i;
                }
                this.defer(this.iterate);
            } else {
                this.load_img(i + 1, run, this.img_loaded);
            }
        },

        finish : function() {
            if (!this.latency) {
                this.latency = this.calc_latency();
            }
            var bw = this.calc_bw(), o = {
                bw : bw.median_corrected,
                bw_err : parseFloat(bw.stderr_corrected),
                lat : this.latency.mean,
                lat_err : parseFloat(this.latency.stderr),
                bw_time : Math.round(new Date().getTime() / 1000)
            };

            BOOMR.addVar(o);
            if (bw.debug_info.length > 0) {
                BOOMR.addVar('bw_debug', bw.debug_info.join(','));
            }

            // If we have an IP address we can make the BA cookie persistent for
            // a while
            // because we'll recalculate it if necessary (when the user's IP
            // changes).
            if (!isNaN(o.bw) && o.bw > 0) {
                BOOMR.utils.setCookie(this.cookie, {
                    ba : Math.round(o.bw),
                    be : o.bw_err,
                    l : o.lat,
                    le : o.lat_err,
                    ip : this.user_ip,
                    t : o.bw_time
                }, (this.user_ip ? this.cookie_exp : 0));
            }

            this.complete = true;
            BOOMR.sendBeacon();
            this.running = false;
        },

        iterate : function() {
            if (this.aborted) {
                return false;
            }

            if (!this.runs_left) {
                this.finish();
            } else if (this.latency_runs) {
                this.load_img('l', this.latency_runs--, this.lat_loaded);
            } else {
                this.results.push({
                    r : []
                });
                this.load_img(images.start, this.runs_left--, this.img_loaded);
            }
        },

        setVarsFromCookie : function(cookies) {
            var ba = parseInt(cookies.ba, 10), bw_e = parseFloat(cookies.be), lat = parseInt(cookies.l, 10) || 0, lat_e = parseFloat(cookies.le) || 0, c_sn = cookies.ip.replace(/\.\d+$/, '0'),
            // Note this is IPv4 only
            t = parseInt(cookies.t, 10), p_sn = this.user_ip.replace(/\.\d+$/, '0'),

            // We use the subnet instead of the IP address because some people
            // on DHCP with the same ISP may get different IPs on the same
            // subnet
            // every time they log in
            t_now = Math.round((new Date().getTime()) / 1000); // seconds
            // If the subnet changes or the cookie is more than 7 days old,
            // then we recheck the bandwidth, else we just use what's in the
            // cookie
            if (c_sn === p_sn && t >= t_now - this.cookie_exp && ba > 0) {
                this.complete = true;
                BOOMR.addVar({
                    'bw' : ba,
                    'lat' : lat,
                    'bw_err' : bw_e,
                    'lat_err' : lat_e
                });

                return true;
            }

            return false;
        }

    };

    BOOMR.plugins.BW = {
        init : function(config) {
            var cookies;

            if (impl.complete) {
                return this;
            }

            BOOMR.utils.pluginConfig(impl, config, 'BW', [
                    'base_url', 'timeout', 'nruns', 'cookie', 'cookie_exp'
            ]);

            if (config && config.user_ip) {
                impl.user_ip = config.user_ip;
            }

            if (!impl.base_url) {
                return this;
            }

            images.start = 0;
            impl.runs_left = impl.nruns;
            impl.latency_runs = 10;
            impl.results = [];
            impl.latencies = [];
            impl.latency = null;
            impl.complete = false;
            impl.aborted = false;

            BOOMR.removeVar('ba', 'ba_err', 'lat', 'lat_err');

            cookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie));

            if (!cookies || !cookies.ba || !impl.setVarsFromCookie(cookies)) {

                BOOMR.subscribe('page_ready', this.run, null, this);
                BOOMR.subscribe('page_unload', this.skip, null, this);
            }

            return this;
        },

        run : function() {

            if (impl.running || impl.complete) {
                return this;
            }

            if (w.location.protocol === 'https:') {
                // we don't run the test for https because SSL stuff will mess
                // up b/w
                // calculations we could run the test itself over HTTP, but then
                // IE
                // will complain about insecure resources, so the best is to
                // just bail
                // and hope that the user gets the cookie from some other page
                BOOMR.info('HTTPS detected, skipping bandwidth test', 'bw');
                impl.complete = true;
                BOOMR.sendBeacon();
                return this;
            }

            impl.running = true;

            setTimeout(this.abort, impl.timeout);

            impl.defer(impl.iterate);

            return this;
        },

        abort : function() {
            impl.aborted = true;
            if (impl.running) {
                impl.finish(); // we don't defer this call because it might be
                // called from
                // onunload and we want the entire chain to complete
                // before we return
            }
            return this;
        },

        is_complete : function() {
            return impl.complete;
        }
    };

}(window)); // end of BW plugin
/* NavTiming plugin */

(function(w) {

    // First make sure BOOMR is actually defined. It's possible that your plugin
    // is loaded before boomerang, in which case
    // you'll need this.
    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    // A private object to encapsulate all your implementation details
    var impl = {
        complete : false,
        done : function() {

            if (this.complete) {
                return;
            }

            var p, pn, pt, data;
            p = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;
            if (p && p.timing && p.navigation) {
                BOOMR.info('This user agent supports NavigationTiming.', 'nt');

                pn = w.performance.navigation;
                pt = w.performance.timing;
                data = {
                    'nt_red_cnt' : pn.redirectCount,
                    'nt_nav_type' : pn.type,
                    'nt_nav_st' : pt.navigationStart,
                    'nt_red_st' : pt.redirectStart,
                    'nt_red_end' : pt.redirectEnd,
                    'nt_fet_st' : pt.fetchStart,
                    'nt_dns_st' : pt.domainLookupStart,
                    'nt_dns_end' : pt.domainLookupEnd,
                    'nt_con_st' : pt.connectStart,
                    'nt_con_end' : pt.connectEnd,
                    'nt_req_st' : pt.requestStart,
                    'nt_res_st' : pt.responseStart,
                    'nt_res_end' : pt.responseEnd,
                    'nt_domloading' : pt.domLoading,
                    'nt_domint' : pt.domInteractive,
                    'nt_domcontloaded_st' : pt.domContentLoadedEventStart,
                    'nt_domcontloaded_end' : pt.domContentLoadedEventEnd,
                    'nt_domcomp' : pt.domComplete,
                    'nt_load_st' : pt.loadEventStart,
                    'nt_load_end' : pt.loadEventEnd,
                    'nt_unload_st' : pt.unloadEventStart,
                    'nt_unload_end' : pt.unloadEventEnd
                };
                if (pt.secureConnectionStart) {
                    // secureConnectionStart is OPTIONAL in the spec
                    data.nt_ssl_st = pt.secureConnectionStart;
                }
                BOOMR.addVar(data);
            }
            this.complete = true;
            BOOMR.sendBeacon();
        }
    };

    BOOMR.plugins.NavigationTiming = {
        init : function() {

            BOOMR.subscribe('page_ready', impl.done, null, impl);
            BOOMR.subscribe('page_unload', impl.done, null, impl);
            return this;
        },

        is_complete : function() {
            return impl.complete;
        }
    };

}(window)); // end of navtiming plugin
/* Memory plugin */

(function(w) {

    // First make sure BOOMR is actually defined. It's possible that your plugin
    // is loaded before boomerang, in which case
    // you'll need this.
    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    // A private object to encapsulate all your implementation details
    var impl = {
        complete : false,
        done : function() {

            var p = w.performance, c = w.console, d = w.document, f = (({}).toString.call(window.opera) == '[object Opera]' ? d.querySelectorAll : d.getElementsByTagName), m;

            m = (p && p.memory ? p.memory : (c && c.memory ? c.memory : null));

            if (m) {
                BOOMR.addVar({
                    'mem.total' : m.totalJSHeapSize,
                    'mem.used' : m.usedJSHeapSize
                });
            }

            if ((typeof (f.call) !== 'undefined') && (f != null)) {
                BOOMR.addVar({
                    'dom.ln' : f.call(d, '*').length,
                    'dom.sz' : f.call(d, 'html')[0].innerHTML.length
                });
            }

            this.complete = true;
            BOOMR.sendBeacon();
        }
    };

    BOOMR.plugins.Memory = {
        init : function() {

            // we do this on onload so that we take a memory and dom snapshot
            // after most things have run
            BOOMR.subscribe('page_ready', impl.done, null, impl);
            return this;
        },

        is_complete : function() {
            return impl.complete;
        }
    };

}(window)); // end of memory plugin

/*
 * IPv6 plugin All beacon parameters are prefixed with ipv6_ Beacon parameters: - ipv6_latency: Latency in milliseconds
 * of getting data from an ipv6 host when connecting to the IP. Set to NA if the client cannot connect to the ipv6 host. -
 * ipv6_lookup: Latency of getting data from a hostname that resolves to an ipv6 address. Set to NA if the client cannot
 * resolve or connect to the ipv6 host.
 */
(function(w) {

    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    /*
     * Algorithm: 1. Try to load a sizeless image from an IPv6 host - onerror, flag no IPv6 connect support and end -
     * onload, measure load time 2. Try to load a sizeless image from a hostname that resolves to an IPv6 address -
     * onerror, flag no IPv6 DNS resolver and end - onload, measure load time
     */
    var impl = {
        complete : false,
        ipv6_url : '',
        host_url : '',
        timeout : 1200,

        timers : {
            ipv6 : {
                start : null,
                end : null
            },
            host : {
                start : null,
                end : null
            }
        },

        start : function() {

            this.load_img('ipv6', 'host');
        },

        load_img : function() {
            var img, rnd = '?t=' + (new Date().getTime()) + Math.random(), timer = 0, error = null, that = this, which = Array.prototype.shift.call(arguments), a = arguments;

            // Terminate if we've reached end of test list
            if (!which || !(which in this.timers)) {
                this.done();
                return false;
            }

            // Skip if URL wasn't set for this test
            if (!this[which + '_url']) {
                return this.load_img.apply(this, a);
            }

            img = new Image();

            img.onload = function() {
                that.timers[which].end = new Date().getTime();
                clearTimeout(timer);
                img.onload = img.onerror = null;
                img = null;

                that.load_img.apply(that, a);
                that = a = null;
            };

            error = function() {
                that.timers[which].supported = false;
                clearTimeout(timer);
                img.onload = img.onerror = null;
                img = null;

                that.done();
                that = a = null;
            };

            img.onerror = error;
            timer = setTimeout(error, this.timeout);
            this.timers[which].start = new Date().getTime();
            img.src = this[which + '_url'] + rnd;

            return true;
        },

        done : function() {
            if (this.complete) {
                return;
            }

            BOOMR.removeVar('ipv6_latency', 'ipv6_lookup');
            if (this.timers['ipv6'].end !== null) {
                BOOMR.addVar('ipv6_latency', this.timers['ipv6'].end - this.timers['ipv6'].start);
            } else {
                BOOMR.addVar('ipv6_latency', 'NA');
            }

            if (this.timers['host'].end !== null) {
                BOOMR.addVar('ipv6_lookup', this.timers['host'].end - this.timers['host'].start);
            } else {
                BOOMR.addVar('ipv6_lookup', 'NA');
            }

            this.complete = true;
            BOOMR.sendBeacon();
        }
    };

    BOOMR.plugins.IPv6 = {
        init : function(config) {

            BOOMR.utils.pluginConfig(impl, config, 'IPv6', [
                    'ipv6_url', 'host_url', 'timeout'
            ]);

            if (!impl.ipv6_url) {
                BOOMR.warn('IPv6.ipv6_url is not set.  Cannot run IPv6 test.', 'ipv6');
                impl.complete = true; // set to true so that is_complete
                // doesn't
                // block other plugins
                return this;
            }

            if (!impl.host_url) {
                BOOMR.warn('IPv6.host_url is not set.  Will skip hostname test.', 'ipv6');
            }

            // make sure that test images use the same protocol as the host page
            if (w.location.protocol === 'https:') {
                impl.ipv6_url = impl.ipv6_url.replace(/^http:/, 'https:');
                impl.host_url = impl.host_url.replace(/^http:/, 'https:');
            } else {
                impl.ipv6_url = impl.ipv6_url.replace(/^https:/, 'http:');
                impl.host_url = impl.host_url.replace(/^https:/, 'http:');
            }

            BOOMR.subscribe('page_ready', impl.start, null, impl);

            return this;
        },

        is_complete : function() {
            return impl.complete;
        }
    };

}(window)); // end of IPv6 plugin

/**
 * \file dns.js Plugin to measure DNS latency. This code is based on Carlos Bueno's guide to DNS on the YDN blog:
 * http://developer.yahoo.net/blog/archives/2009/11/guide_to_dns.html
 */

// w is the window object
(function(w) {

    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    var impl = {
        complete : false,
        base_url : '',
        t_start : null,
        t_dns : null,
        t_http : null,
        img : null,

        gen_url : '',

        start : function() {

            if (impl.gen_url) { // already running
                return;
            }

            var random = Math.floor(Math.random() * (2147483647)).toString(36), cache_bust = '' + (new Date().getTime()) + (Math.random());

            impl.gen_url = impl.base_url.replace(/\*/, random);

            impl.img = new Image();
            impl.img.onload = impl.A_loaded;

            impl.t_start = new Date().getTime();
            impl.img.src = impl.gen_url + 'image-l.gif?t=' + cache_bust;

        },

        A_loaded : function() {
            var cache_bust;
            impl.t_dns = new Date().getTime() - impl.t_start;

            cache_bust = '' + (new Date().getTime()) + (Math.random());

            impl.img = new Image();
            impl.img.onload = impl.B_loaded;

            impl.t_start = new Date().getTime();
            impl.img.src = impl.gen_url + 'image-l.gif?t=' + cache_bust;
        },

        B_loaded : function() {
            impl.t_http = new Date().getTime() - impl.t_start;

            impl.img = null;
            impl.done();
        },

        done : function() {
            // DNS time is the time to load the image with uncached DNS
            // minus the time to load the image with cached DNS
            var dns = impl.t_dns - impl.t_http;

            BOOMR.addVar('dns', dns);
            impl.complete = true;
            impl.gen_url = '';
            BOOMR.sendBeacon();
        },

        read_timing_api : function(t) {
            if (typeof t.domainLookupStart === 'undefined' || typeof t.domainLookupEnd === 'undefined') {
                return false;
            }

            // This will be 0 if we read DNS from cache, but that's what
            // we want because it's what the user experiences
            BOOMR.addVar('dns', t.domainLookupEnd - t.domainLookupStart);

            impl.complete = true;

            return true;
        }
    };

    BOOMR.plugins.DNS = {
        init : function(config) {

            BOOMR.utils.pluginConfig(impl, config, 'DNS', [
                'base_url'
            ]);

            // If this browser supports the WebTiming API, then we just
            // use that and don't bother doing the test
            if (w.performance && w.performance.timing) {
                if (impl.read_timing_api(w.performance.timing)) {
                    return this;
                }
            }

            if (!impl.base_url) {
                BOOMR.warn('DNS.base_url is not set.  Cannot run DNS test.', 'dns');
                impl.complete = true; // set to true so that is_complete
                // doesn't
                // block other plugins
                return this;
            }

            // do not run test over https
            if (w.location.protocol === 'https:') {
                impl.complete = true;
                return this;
            }

            BOOMR.subscribe('page_ready', impl.start, null, impl);

            return this;
        },

        is_complete : function() {
            return impl.complete;
        }
    };

}(window));

/**
 * SFDC implementation SFDC config plugin config.js given an orgID should generate something like below
 * BOOMR_configt=new Date().getTime();BOOMR.init( {log: null,site_domain: "salesforce.com",BW: {enabled: false},IPv6: {
 * enabled: false},DNS: { enabled:false},user_ip: "173.164.175.102"} );
 *
 * @param {!window} w
 */
(function(w) {
    var doc = w.document, script = 'script', complete = false, pass = false, start_ts, done = function() {
        if (complete) {
            return;
        }
        complete = true;
        pass = false;
        BOOMR.sendBeacon();
    }, run = function() {
        var k = doc.getElementsByTagName(script)[0], d = doc.createElement(script);
        start_ts = new Date().getTime();
        d.src = window["BOOMR_cURL"];
        k.parentNode.insertBefore(d, k);
    };
    /**
     * @namespace
     */
    BOOMR.plugins.SFDC = {
        /**
         * @return {Object}
         */
        init : function() {

            if (complete) {
                return this;
            }
            // is_complete returns true only after executing the following code
            // let it pass the first time the plugin initializes ..so it can
            // subsribe to page_ready
            if (pass) {

                setTimeout(done, 10);
                /* Time taken to download, parse and execut the config JS */
                BOOMR.addVar('t_cjs', new Date().getTime() - start_ts);
                if (typeof BOOMR_configt != 'undefined') {
                    /* Time taken until the first byte of config JS */
                    BOOMR.addVar('t_cfb', BOOMR_configt - start_ts);
                    delete BOOMR_configt;
                }
                return null;
            }
            pass = true;
            // the config js is triggered to download async after page_ready
            BOOMR.subscribe('page_ready', run, null, null);
            return this;
        },
        /**
         * @return {!boolean}
         */
        is_complete : function() {
            return complete;
        }
    };
}(window)); // end of config plugin

/**
 * Disable all plugins by default and only enable the needed through the config plugin Only SFDC config plugin, RT
 * plugins are enabled default
 */
BOOMR.init({
    log : null,
    wait : true,
    BW : {
        enabled : false
    },
    DNS : {
        enabled : false
    },
    IPv6 : {
        enabled : false
    },
    SFDC : {
        enabled : false
    },
    autorun : false

});

// This is to get the end time of Jiffy JS parsing
BOOMR.t_end = new Date().getTime();

/** This file is used for the closure compiler in advanced mode to define custom data types and allows for better minification and type checking */

/** @typedef {{name: !string, value: !number}} */
window.typePerfLogLevel;

/** @typedef {{measure: !string, mark: !string, et: !number, rt: !number}} */
window.typejsonMeasure;

/**
 * The interface used to stub out some of the IPerf functions. Used when Jiffy
 * is not enabled.
 *
 * @interface
 */
function IPerfStubs() {}
/**
 * @param {!string} id The id used to identify the mark.
 * @param {window.typePerfLogLevel=} logLevel The level at which this mark should
 * be logged at.
 * @return {!IPerf}
 */
IPerfStubs.prototype.mark;
/**
 * @param {!string} id This is the id associated with the mark that uses
 * the same id.
 * @param {window.typePerfLogLevel=} logLevel The level at which this mark should
 * be logged at.
 * @return {!IPerf}
 */
IPerfStubs.prototype.endMark;
/**
 * Add a performance measurement from the server.
 * @param {!string} label
 * @param {!number} elapsedMillis
 */
IPerfStubs.prototype.stat;
/**
 * @param {?string} measureName Not used.
 * @param {!string} id This is the id associated with the mark that uses the same id.
 * @param {window.typePerfLogLevel=} logLevel The level at which this mark should be logged at.
 * @deprecated Use endMark instead
 */
IPerfStubs.prototype.measure;

/**
 * The interface used with the Perf object.
 *
 * @interface
 * @extends IPerfStubs
 */
function IPerf() {}
/**
 * @type {!window.typePerfLogLevel}
 * @private
 */
IPerf.prototype.currentLogLevel;
/**
 * @param {!string} id The id used to identify the mark.
 * @param {window.typePerfLogLevel=} logLevel The level at which this mark should
 * be logged at.
 * @return {!IPerf}
 * @override
 */
IPerf.prototype.mark;
/**
 * @param {!string} id This is the id associated with the mark that uses
 * the same id.
 * @param {window.typePerfLogLevel=} logLevel The level at which this mark should
 * be logged at.
 * @return {!IPerf}
 * @override
 */
IPerf.prototype.endMark;
/**
 * @param {!string} timer_name The name of the timer to set.
 * @param {!number} timer_delta The delta of timestamps to set.
 * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults to PerfLogLevel.INTERNAL if left blank
 * @return {!IPerf}
 */
IPerf.prototype.setTimer;
/**
 * Serializes a measure object to JSON.
 * @param {!window.typejsonMeasure} measure The measure to serialize.
 * @return {!string} JSON-serialized version of the supplied measure.
 */
IPerf.prototype.measureToJson;
/**
 * Serializes timers to JSON.
 * @param {boolean=} includeMarks
 * @return {!string} JSON-serialized version of timers.
 */
IPerf.prototype.toJson;
/**
 * Get a JSON-serialized version of all existing timers and stats in POST friendly format.
 * @return {!string} POST-friendly timers and stats.
 */
IPerf.prototype.toPostVar;
/**
 * @return {!Array.<!window.typejsonMeasure>} all existing measures.
 */
IPerf.prototype.getMeasures;
/**
 * @return {!string} beacon data.
 */
IPerf.prototype.getBeaconData;
/**
 * sets beacon data.
 */
IPerf.prototype.setBeaconData;
/**
 * clears beacon data.
 */
IPerf.prototype.clearBeaconData;
/**
 * Removes stats.
 */
IPerf.prototype.removeStats;
/**
 * @param {!string} tName The id used to identify the transaction.
 * @return {!IPerf} for chaining methods
 * @override
 */
IPerf.prototype.startTransaction;
/**
 * @param {!string} tName The id used to identify the transaction.
 * @return {!IPerf} for chaining methods
 * @override
 */
IPerf.prototype.endTransaction;
/**
 * @param {!string} oldName The id used to identify the old transaction name.
 * @param {!string} newName The id used to identify the new transaction name.
 * @return {!IPerf}
 * @override
 */
IPerf.prototype.updateTransaction;
/**
 * Gets the stats related to previous transaction
 */
IPerf.prototype.getStats;
/**
 * Add a performance measurement from the server.
 * @param {!string} label
 * @param {!number} elapsedMillis
 * @return {!IPerf}
 * @override
 */
IPerf.prototype.stat;
/**
 * Get the stored server side performance measures.
 * @param {!string} label
 * @return {!number}
 */
IPerf.prototype.getStat;
/**
 * @param {?string} measureName Not used.
 * @param {!string} id This is the id associated with the mark that uses the same id.
 * @param {window.typePerfLogLevel=} logLevel The level at which this mark should be logged at.
 * @return {!IPerf}
 * @deprecated Use endMark instead
 * @override
 */
IPerf.prototype.measure;

/** @param {!Window} w */
(function(w) {
    "use strict";

    /**
     * @const
     * @private
     * @type {!string}
     */
    var BEACONURL = "/_ui/common/request/servlet/JiffyServlet";

    /**
     * @private
     * @type {!string}
     */
    var beaconData = '';

    /**
     * Note: this is serialized (and therefore duplicated) as part of main.js from ui.performance.PerfLogLevel (and this
     * needs to be updated if PerfLogLevel changes)
     *
     * @enum {{name: !string, value: !number}}
     */
    var PerfLogLevel = {
        /** @expose */
        DEBUG : {
            name : "DEBUG",
            value : 1
        },
        /** @expose */
        INTERNAL : {
            name : "INTERNAL",
            value : 2
        },
        /** @expose */
        PRODUCTION : {
            name : "PRODUCTION",
            value : 3
        }
    };

    /**
     * Various Jiffy constants.
     *
     * @enum {!string}
     */
    var JiffyConstants = {
        /** @expose */
        PAGE_START_MARK : "PageStart",
        /** @expose */
        JIFFY_PAYLOAD_PARAM : "bulkJiffy",
        /** @expose */
        MARK_NAME : "mark",
        /** @expose */
        MEASURE_NAME : "measure",
        /** @expose */
        MARK_START_TIME : "st",
        /** @expose */
        MARK_LAST_TIME : "lt",
        /** @expose */
        PAGE_NAME : "pn",
        /** @expose */
        ELAPSED_TIME : "et",
        /** @expose */
        REFERENCE_TIME : "rt",
        /** @expose */
        JIFFY_LOAD_DONE : "loadDone"
    };

    /**
     * todo: synchronize these with values from PerfTools.java
     *
     * @enum {!string}
     * @expose
     */
    JiffyConstants.STATS = {
        /** @expose */
        NAME : "stat",
        /** @expose */
        SERVER_ELAPSED : "internal_serverelapsed",
        /** @expose */
        DB_TOTAL_TIME : "internal_serverdbtotaltime",
        /** @expose */
        DB_CALLS : "internal_serverdbcalls",
        /** @expose */
        DB_FETCHES : "internal_serverdbfetches"
    };

    /**
     * This is the shim object to support the existing mark and measure functionality
     *
     * @namespace
     * @const
     * @type {!IPerf}
     */
    var Perf = /** @type {!IPerf} */
    ({
        /**
         * @type {!window.typePerfLogLevel}
         * @private
         */
        currentLogLevel : PerfLogLevel.INTERNAL,

        /**
         * @type {!number}
         * @const
         * @expose
         */
        startTime : w["pageStartTime"],

        /**
         * Converts the logLevel param into a valid window.typePerfLogLevel.
         *
         * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults
         *        to PerfLogLevel.INTERNAL if left blank
         * @return {!window.typePerfLogLevel}
         * @private
         */
        getLogLevel : function(logLevel) {
            if (typeof logLevel === "string") {
                logLevel = PerfLogLevel[logLevel];
            }
            return logLevel || PerfLogLevel.INTERNAL;
        },

        /**
         * @param {!string} id The id used to identify the mark.
         * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults
         *        to PerfLogLevel.INTERNAL if left blank
         * @return {!IPerf}
         * @expose
         */
        mark : function(id, logLevel) {
            // don't log things that are less important than the current logging
            // level
            if (Perf.currentLogLevel.value <= Perf.getLogLevel(logLevel).value) {
                BOOMR.plugins.RT.startTimer(id);
            }
            return Perf;
        },
        /**
         * @param {!string} id This is the id associated with the mark that uses the same id.
         * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults
         *        to PerfLogLevel.INTERNAL if left blank
         * @return {!IPerf}
         * @expose
         */
        endMark : function(id, logLevel) {
            // don't log things that are less important than the current logging
            // level
            if (Perf.currentLogLevel.value <= Perf.getLogLevel(logLevel).value) {
                BOOMR.plugins.RT.endTimer(id);
            }
            return Perf;
        },
        /**
         * @param {!string} timer_name The name of the timer to set.
         * @param {number=} timer_delta The time delta to set.
         * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults
         *        to PerfLogLevel.INTERNAL if left blank
         * @return {!IPerf}
         * @expose
         */
        setTimer : function(timer_name, timer_delta, logLevel) {
            if (Perf.currentLogLevel.value <= Perf.getLogLevel(logLevel).value) {
                if(timer_delta >= 0) {
                    BOOMR.plugins.RT.setTimer(timer_name, timer_delta);
                } else {
                    BOOMR.plugins.RT.endTimer(timer_name);
                }
            }
            return Perf;
        },
        /**
         * Serializes a measure object to JSON.
         *
         * @param {!window.typejsonMeasure} measure The measure to serialize.
         * @return {!string} JSON-serialized version of the supplied measure.
         * @expose
         */
        measureToJson : function(measure) {
            return [
                    "{", JiffyConstants.MEASURE_NAME, ':"', measure[JiffyConstants.MEASURE_NAME], '",', JiffyConstants.MARK_NAME, ':"', measure[JiffyConstants.MARK_NAME], '",', JiffyConstants.ELAPSED_TIME, ":", measure[JiffyConstants.ELAPSED_TIME],
                    ",", JiffyConstants.REFERENCE_TIME, ":", measure[JiffyConstants.REFERENCE_TIME], "}"
            ].join("");
        },

        /**
         * Serializes timers to JSON.
         *
         * @param {boolean=} includeMarks
         * @return {!string} JSON-serialized version of timers.
         * @expose
         * @suppress {checkTypes}
         */
        toJson : function(includeMarks) {
            // check and update any newly created timers
            BOOMR.plugins.RT.updateVars();
            // this is a hack to include RT in the beacon - sorry this is the quickest fix I could come up with.
            var timers = BOOMR.plugins.RT.getTimers(),
            rt = BOOMR.plugins.RT.getSessionStart(),
            json = ["{",'sessionID:"', BOOMR.plugins.RT.getSessionID(),'",', "st:", rt, ",", 'pn:"', w.document.URL, '",', 'uid:"', Math.round(Math.random() * 1000000000000000), '",'],
                markJson = [], measureJson = [], k, measure, vars = BOOMR.getVars(), timer;

            for (k in vars) {
                if ((k != "r") && (k != "r2") && (k != "t_other")) {
                    if (vars.hasOwnProperty(k) && !isNaN(vars[k])) {
                        if(includeMarks) {
                           markJson.push('"' + k + '":' + vars[k]);
                        }
                        measure = {};
                        measure[JiffyConstants.MEASURE_NAME] = k;
                        measure[JiffyConstants.MARK_NAME] = k;
                        measure[JiffyConstants.ELAPSED_TIME] = vars[k];
                        timer = timers[k];
                        measure[JiffyConstants.REFERENCE_TIME] = (timer && timer.start) ? timer.start : rt;
                        measureJson.push(Perf.measureToJson(measure));
                    }
                }
            }
            if(includeMarks) {
               json.push("marks:{", markJson.join(","), "},");
            }
            json.push("measures:[", measureJson.join(","), "]}");

            return json.join("");
        },

        /**
         * Get a JSON-serialized version of all existing timers and stats in POST friendly format.
         *
         * @return {!string} POST-friendly timers and stats.
         * @expose
         */
        toPostVar : function() {
            return JiffyConstants.JIFFY_PAYLOAD_PARAM + "=" + Perf.toJson().replace(/&/g, "__^__");
        },

        /**
         * Returns all of the measures that have been captured
         *
         * @return {!Array.<window.typejsonMeasure>} all existing measures.
         * @expose
         */
        getMeasures : function() {
            // check and update any newly created timers
            BOOMR.plugins.RT.updateVars();
            var timers = BOOMR.plugins.RT.getTimers(),
            rt = BOOMR.plugins.RT.getSessionStart(), measures = [], vars = BOOMR.getVars(), k, measure;
            for (k in vars) {
                if ((k != "r") && (k != "r2") && (k != "t_other")) {
                    if (vars.hasOwnProperty(k) && !isNaN(vars[k])) {
                        measure = {};
                        measure[JiffyConstants.MEASURE_NAME] = k;
                        measure[JiffyConstants.MARK_NAME] = k;
                        measure[JiffyConstants.ELAPSED_TIME] = vars[k];
                        measure[JiffyConstants.REFERENCE_TIME] = timers[k] ? timers[k].start : rt;
                        measures.push(measure);
                    }
                }
            }

            return measures;
        },

        /**
         * Returns the beaconData to piggyback on the next XHR call
         *
         * @expose
         */
        getBeaconData : function() {
            return beaconData;
        },

        /**
         * Sets the beaconData to piggyback on the next XHR call
         *
         * @expose
         */
        setBeaconData : function(_beaconData) {
            beaconData = _beaconData;
        },

        /**
         * Clears the beaconData
         *
         * @expose
         */
        clearBeaconData : function() {
            beaconData = '';
        },

        /**
         * Removes the existing timers
         *
         * @expose
         */
        removeStats : function() {
            BOOMR.removeStats();
        },

        /**
         * @private
         * @param {!Object.<String,*>=} args Arguments to initialize the Perf object.
         * @expose
         */
        init : function(args) {
            BOOMR.init(args);
        },
        
        /**
         * SFDC implementation This is to re-init the beacon_url 
         * (used on unauthenticated pages)
         * 
         * @param {!string} url The URL to use for beaconing data
         * @private
         * @expose
         */
        setBeaconUrl : BOOMR.setBeaconUrl,

        /**
         * @typedef {BOOMR.subscribe}
         */
        subscribe : BOOMR.subscribe,

        /**
         * Add a performance measurement from the server.
         *
         * @param {!string} label
         * @param {!number} elapsedMillis
         * @return {!IPerf}
         * @expose
         */
        stat : function(label, elapsedMillis) {
            //Changing the implementation so we can separate out stats and measures
            BOOMR.addVar("st_" + label, elapsedMillis);
            return Perf;
        },

        /**
         * Get the stored server side performance measures.
         *
         * @param {!string} label
         * @return {!number}
         * @expose
         */
        getStat : function(label) {
            // check and update any newly created timers
            BOOMR.plugins.RT.updateVars();
            if (!label) {
                return -1;
            }
            return BOOMR.getVar(label);
        },

        /**
         * Called when the page is ready to interact with. To support the existing Jiffy.onLoad method.
         * 
         * @expose
         */
        onLoad : function() {
            BOOMR.page_ready();
        },

        /**
         * @param {?string} measureName Not used.
         * @param {!string} id This is the id associated with the mark that uses the same id.
         * @param {window.typePerfLogLevel=} logLevel The level at which this mark should be logged at.
         * @return {!IPerf}
         * @deprecated Use endMark instead
         * @expose
         */
        measure : function(measureName, id, logLevel) {
            return Perf.endMark(id, logLevel);
        },

        /**
         * SFDC implementation This method is used to mark the start of a transaction
         *
         * @param {!string} tName The id used to identify the transaction
         * @return {!IPerf} for chaining methods
         * @expose
         */
        startTransaction : function(tName) {
            return BOOMR.plugins.RT.startTransaction(tName);
        },

        /**
         * SFDC implementation This method is used to mark the end of a
         * transaction.
         *
         * @param {!string} tName The id used to identify the transaction
         * @return {!IPerf} for chaining methods
         * @expose
         */
        endTransaction : function(tName) {
            return BOOMR.plugins.RT.endTransaction(tName);
        },
        
        /**
         * SFDC implementation This method is used to the update the name of the
         * transaction
         *
         * @param {!string} oldName The id used to identify the old transaction name.
         * @param {!string} newName The id used to identify the new transaction name.
         * @return {!IPerf} for chaining methods
         * @expose
         */
        updateTransaction : function(oldName, newName) {
            return BOOMR.plugins.RT.updateTimer(oldName, newName);
        },

        /**
         * This method is used to figure if onLoad/page_ready has been fired or
         * not
         *
         * @return {!boolean}
         * @expose
         */
        onLoadFired : function() {
            return BOOMR.plugins.RT.onLoadFired();
        },

        /**
         * @namespace
         * @expose
         */
        util : {
            /**
             * Sets the roundtrip time cookie
             *
             * @param {!string} name
             * @param {!string|number} value
             * @param {!Date} expires
             * @param {!string} path
             * @expose
             */
            setCookie : function(name, value, expires, path) {
                document.cookie = name + '=' + escape(value + '') + ((expires) ? '; expires=' + expires.toGMTString() : '') + ((path) ? '; path=' + path : '; path=/');
            }
        },

        /**
         * @type {boolean}
         * @const
         * @expose
         */
        loaded : true, // to make Eightball work

        /**
         * Whether the full Jiffy framework is loaded, as opposed to just the stubs.
         *
         * @type {boolean}
         * @const
         * @expose
         */
        enabled : true
    });

    w["Perf"] = Perf;
    w["Jiffy"] = Perf;
    w["PerfLogLevel"] = PerfLogLevel;
    w["JiffyConstants"] = JiffyConstants;
})(window);