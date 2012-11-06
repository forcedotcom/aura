var JiffyConstants = {
    JIFFY_PAYLOAD_PARAM         : "bulkJiffy",
    COOKIE_PREVIOUS_URL_NAME    : "prevUnloadUrl",
    COOKIE_UNLOAD_NAME          : "prevUnloadTime",
    COOKIE_NAME                 : "enableJiffy",
    JIFFY_URL                   : "/_ui/common/request/servlet/JiffyServlet",
    PAGE_START_MARK             : "PageStart",
    PREVIOUS_UNLOAD_MARK        : "EndUserResponseTime",
    END_USER_RESPONSE_MEASURE   : "responseTime",
    PAGE_HEAD           : "pageHead",
    PAGE_BODY           : "pageBody",
    LOAD_DONE_MEASURE   : "pageLoadDone",
    PAGE_LOAD_HANDLERS  : "PageLoadHandlers",
    TRANSACTION_DONE_MEASURE : "transactionDone",

    // todo: synchronize these with values from PerfTools.java
    STATS : {
        NAME            : "stat",
        SERVER_ELAPSED  : "internal_serverelapsed",
        DB_TOTAL_TIME   : "internal_serverdbtotaltime",
        DB_CALLS        : "internal_serverdbcalls",
        DB_FETCHES      : "internal_serverdbfetches"
    },

    MARK_NAME           : "mark",
    MEASURE_NAME        : "measure",
    MARK_START_TIME     : "startTime",
    MARK_LAST_TIME      : "lastTime",
    PAGE_NAME           : "pn",
    ELAPSED_TIME        : "et",
    REFERENCE_TIME      : "rt",
    JIFFY_LOAD_DONE     : "loadDone"
};

// Gaaah, this sucks.  Need a good way of JS-serializing enums at any time...
// Note: this is seralized (and therefore duplicated) as part of main.js from ui.performance.PerfLogLevel (and this needs to be updated if PerfLogLevel changes)
var PerfLogLevel = {"INTERNAL":{"name":"INTERNAL","value":2},"DEBUG":{"name":"DEBUG","value":1},"PRODUCTION":{"name":"PRODUCTION","value":3}};
/**
 * @exports Jiffy as Sfdc.Perf
 */
var Jiffy = function() {
    /*-***********-*/
    /*   PRIVATE   */
    /*-***********-*/
    var pageName = encodeURI(window.location.toString().replace(/#/g, "_"));
    var uid = Math.round(Math.random() * 1000000000000000);

    var marks = {};
    var measures = [];
    var serverStats = [];
    var lastMeasure = null;

    // add default page start mark
    marks[JiffyConstants.PAGE_START_MARK] = {
        startTime  : window.pageStartTime,
        lastTime   : window.pageStartTime
    };

    function createNewMeasure(markName, measureName, elapsedTime, refTime) {
        var measure = {};
        measure[JiffyConstants.MARK_NAME] = markName;
        measure[JiffyConstants.MEASURE_NAME] = measureName;
        measure[JiffyConstants.ELAPSED_TIME] = elapsedTime;
        measure[JiffyConstants.REFERENCE_TIME] = refTime;

        measures.push(measure);
        return measure;
    }

    /* LISTENERS */
    var eventListeners = {};

    function callListeners(eventName, data) {
        var listeners = eventListeners[eventName];
        if (listeners) {
            for (var i=0, len=listeners.length; i < len; i++) {
                listeners[i](data);
            }
        }
    }

    // If activityTracking is enabled, we will reset all Jiffy data on every mouse button up
    // Please note that this is a temporary fix until we have a more robust framework to track interaction performance
    // https://gus.soma.salesforce.com/a07B0000000FmUV?srPos=0&srKp=a07
    document.onmouseup = function() {
        if (Jiffy.trackActivities) {
            Jiffy.flush();
            window.pageStartTime = (new Date()).getTime();
            marks[JiffyConstants.PAGE_START_MARK] = {
                    startTime : window.pageStartTime,
                    lastTime : window.pageStartTime
                };
        }
    };

    /************/
    /** PUBLIC **/
    /************/
    return /** @lends Sfdc.Perf */ {
        currentLogLevel: PerfLogLevel.INTERNAL,

        /** Whether the full Jiffy framework is loaded, as opposed to just the stubs. */
        enabled: true,

        /**
         * Whether the "loadDone" measure has occurred.
         * Note that this measure may or may not be tied directly to the page's onload event.
         */
        loaded: false,

        /**
         *  enables tracking of activities (see onmouseup override above)
         */
        trackActivities: false,

        /**
         * Creates a named mark in time.
         *
         * @param markName    The name of this mark.
         * @param logLevel    PerfLogLevel at which Jiffy should be running for this mark to be picked up
         */
        mark: function(markName, logLevel) {
            var currTime = (new Date()).getTime();

            logLevel = logLevel || PerfLogLevel.INTERNAL;

            // don't log things that are less important than the current logging level
            if (Jiffy.currentLogLevel.value > logLevel.value) {
                return;
            }

            if (marks[markName] === undefined) {
                // if the mark does not exist, create it
                marks[markName] = {
                    startTime  : currTime,
                    lastTime   : currTime
                };
            } else {
                // otherwise just update the last time it was referenced
                marks[markName].lastTime = currTime;
            }

            callListeners(JiffyConstants.MARK_NAME, marks[markName]);
        },

        /**
         * Creates a named measure.
         * Elapsed time is measured with respect to the supplied mark.
         * If no mark is supplied, defaults to the mark representing the start of page parsing..
         *
         * @param measureName  The name of this measure.
         * @param markName     The name of the (existing) mark to measure against.  Defaults to mark representing the start of page parsing.
         * @param logLevel     PerfLogLevel at which Jiffy should be running for this measure to be picked up
         */
        measure: function(measureName, markName, logLevel) {
            var currTime = new Date().getTime();
            var refStartTime;
            var elapsedTime;
            var measure;

            if ((Jiffy.loaded) && (Jiffy.trackActivities)) {
                lastMeasure = {};
                lastMeasure[JiffyConstants.MARK_NAME] = JiffyConstants.MARK_START_TIME;
                lastMeasure[JiffyConstants.MEASURE_NAME] = JiffyConstants.TRANSACTION_DONE_MEASURE;
                Jiffy.getMark(JiffyConstants.PAGE_START_MARK)[JiffyConstants.MARK_LAST_TIME] = currTime;
                lastMeasure[JiffyConstants.ELAPSED_TIME] = Jiffy.getLoadTime();
                lastMeasure[JiffyConstants.REFERENCE_TIME] = currTime;
            }

            markName = markName || JiffyConstants.PAGE_START_MARK;

            logLevel = logLevel || PerfLogLevel.INTERNAL;

            // don't log things that are less important than the current logging level
            if (Jiffy.currentLogLevel.value > logLevel.value) {
                return;
            }

            if (marks[markName]) {
                refStartTime = marks[markName].lastTime;
                elapsedTime = currTime - refStartTime;
                marks[markName].lastTime = currTime;

                measure = createNewMeasure(markName, measureName, elapsedTime, refStartTime);

                callListeners(JiffyConstants.MEASURE_NAME, measure);
            }
        },

        /**
         * Serializes all existing marks and measures to JSON.
         *
         * @return JSON-serialized version of all existing marks and measures
         */
        toJson: function() {
            if (Jiffy.trackActivities) {
                // if we have a last measure, and it is not on the measures stack...push it
                if (lastMeasure !== null) {
                    if (measures.indexOf(lastMeasure) === -1) {
                        measures.push(lastMeasure);
                    }
                }
            }
            var json = [
                '{',
                'uid:', uid, ',',
                'st:', pageStartTime, ',',
                'pn:"', pageName, '",'
            ];

            var markJson = [];
            for (var markName in marks) {
                if (marks.hasOwnProperty(markName)) {
                    markJson.push('"' + markName + '":' + marks[markName].startTime);
                }
            }
            json.push('marks:{', markJson.join(','), '},');

            var measureJson = [];
            for (var i = 0, len = measures.length; i < len; i++) {
                measureJson.push(this.measureToJson(measures[i]));
            }
            json.push('measures:[', measureJson.join(','), ']}');

            return json.join('');
        },

        /**
         * Serializes a measure object to JSON.
         *
         * @param measure  The measure to serialize.
         *
         * @return JSON-serialized version of the supplied measure
         */
        measureToJson: function(measure) {
            return ['{',
                JiffyConstants.MEASURE_NAME,  ':"', measure[JiffyConstants.MEASURE_NAME], '",',
                JiffyConstants.MARK_NAME,     ':"', measure[JiffyConstants.MARK_NAME],    '",',
                JiffyConstants.ELAPSED_TIME,  ':',  measure[JiffyConstants.ELAPSED_TIME], ',',
                JiffyConstants.REFERENCE_TIME,':',  measure[JiffyConstants.REFERENCE_TIME],
            '}'].join('');
        },

        /**
         * Issues an asynchronous request to a server endpoint containing all existing marks and measures as JSON.
         * This is currently called in response to the page unload event to ensure all marks and measures are reported.
         */
        reportToServer: function() {
            Jiffy.util.postXHR(JiffyConstants.JIFFY_URL, null, this.toPostVar());
        },

        /**
        * Get a JSON-serialized version of all existing marks and measures in POST friendly format.
        *
        * @return POST-friendly marks and measures.
        */
        toPostVar: function() {
            return JiffyConstants.JIFFY_PAYLOAD_PARAM + '=' + this.toJson().replace(/&/g, "__^__");
        },

        /**
         * @return all existing marks
         */
        getMarks: function() {
            return marks;
        },

        /**
         * @param markName  The name of the mark to return
         *
         * @return mark matching supplied name, or undefined if no such mark is found
         */
        getMark: function(markName) {
            return marks[markName];
        },

        /**
         * @return all existing measures
         */
        getMeasures: function() {
            return measures;
        },

        /**
         * Gets all measures matching the supplied name, optionally filtering by a mark name.
         *
         * @param measureName  The name of the measures to return
         * @param markName     Optional, return only measures that belong to this mark
         *
         * @return an array of measure objects with the supplied measureName, or null if no measures are found
         */
        getMeasure: function(measureName, markName) {
            var ret = [];

            for(var i = 0; i < measures.length; i++) {
                if (markName && measures[i][JiffyConstants.MARK_NAME] != markName) {
                    continue;
                }

                if(measures[i][JiffyConstants.MEASURE_NAME] == measureName) {
                    ret.push(measures[i]);
                }
            }
            return (ret.length === 0) ? null : ret;
        },

        /**
         * Utility method to get the page load time in ms.  Measures the time from the start of page parsing to the time at which Jiffy.onLoad is called.
         *
         * @return the page load time in ms, or -1 if the page load has not occurred or failed to measure
         */
        getLoadTime: function() {
            var lastTime = Jiffy.getMark(JiffyConstants.PAGE_START_MARK)[JiffyConstants.MARK_LAST_TIME];
            var startTime = Jiffy.getMark(JiffyConstants.PAGE_START_MARK)[JiffyConstants.MARK_START_TIME];
            return (lastTime === startTime) ? -1 : lastTime - startTime;
        },

        /**
         * Utility method to get the end-user response time in ms.  Measures from the time Jiffy.onUnload was called for the previous page to the time at which Jiffy.onLoad is called for the current page.
         *
         * @return the end-user response time in ms, or -1 if the page load has not occurred, the previous page unload was not timed, or failed to measure
         */
        getEndUserResponseTime: function() {
            var m = this.getMeasure(JiffyConstants.END_USER_RESPONSE_MEASURE, JiffyConstants.PREVIOUS_UNLOAD_MARK);
            return m && m[0] ? m[0][JiffyConstants.ELAPSED_TIME] : -1;
        },

        /**
         * Utility method to get the client-side timestamp representing the start of page parsing.
         *
         * @return the reference timestamp used to mark the start of page parsing
         */
        getStartTime: function() {
            return pageStartTime;
        },

        /**
         * Clears all existing marks and measures except the initial mark representing the start of page parsing.
         */
        clearMeasures: function() {
            measures = [];
            marks = {
                "PageStart": {
                    startTime: pageStartTime,
                    lastTime: pageStartTime
                }
            };
        },

        onLoad: function() {
            this.measure(JiffyConstants.LOAD_DONE_MEASURE, JiffyConstants.PAGE_START_MARK, PerfLogLevel.PRODUCTION);
            //Get unload time and previous page URL from cookie
            var unloadTimeCookieValue = Jiffy.util.getCookie(JiffyConstants.COOKIE_UNLOAD_NAME);
            var unloadUrlCookieValue = Jiffy.util.getCookie(JiffyConstants.COOKIE_PREVIOUS_URL_NAME);
            //Add end-user-response time measure if the unload time came from the previous page (check Referrer header)
            if (unloadTimeCookieValue && unloadUrlCookieValue && unloadUrlCookieValue == document.referrer) {
                var prevUnloadTime = parseFloat(unloadTimeCookieValue);
                var endUserResponseTime = marks[JiffyConstants.PAGE_START_MARK].lastTime - prevUnloadTime;
                marks[JiffyConstants.PREVIOUS_UNLOAD_MARK] = {startTime: prevUnloadTime, lastTime: Jiffy.getLoadTime()};
                createNewMeasure(JiffyConstants.PREVIOUS_UNLOAD_MARK, JiffyConstants.END_USER_RESPONSE_MEASURE, endUserResponseTime, prevUnloadTime);
            }
            Jiffy.loaded = true;
            callListeners(JiffyConstants.JIFFY_LOAD_DONE);
        },

        onUnload: function() {
            this.reportToServer();
            Jiffy.util.setCookie(JiffyConstants.COOKIE_UNLOAD_NAME, (new Date()).getTime(), null, null);
            Jiffy.util.setCookie(JiffyConstants.COOKIE_PREVIOUS_URL_NAME, window.location, null, null);
        },

        registerListener : function(eventName, fn) {
            if (eventName === JiffyConstants.JIFFY_LOAD_DONE && this.loaded) {
                fn();
            } else {
                eventListeners[eventName] = eventListeners[eventName] || [];
                eventListeners[eventName].push(fn);
            }
        },

        // Add a performance measurement from the server.
        stat: function(label, elapsedMillis) {
            var stat = {label: label, elapsedMillis: elapsedMillis};

            serverStats.push(stat);

            // a pagestart stat means that a new page has loaded. with a new
            // page, tell the debug window.
            // there are better ways to do this and this way is a bit of a hack.
            if(stat.label === "pagestart" && perfStatsUiEnabled()) {
                PerfStatsWindow.onPageStart();
            }
        },
        getAllStats: function() {
            return serverStats;
        },
        getStat: function(label) {
            for(var i = 0; i < serverStats.length; i++) {
                if(serverStats[i].label === label) {
                    return serverStats[i].elapsedMillis;
                }
            }
            return -1;
        },

        // flushes all marks and measures, and resetting timings
        flush: function() {
            lastMeasure = null;
            marks = {};
            measures = [];
            marks[JiffyConstants.PAGE_START_MARK] = {
                    startTime : -1,
                    lastTime : -1
                };
        }
    };
}();

Jiffy.util = {
    createXHR : function() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e1) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e2) {
                }
            }
        }
        return null;
    },

    postXHR : function(url, handler, postBody, errorHandler) {
        var request = Jiffy.util.createXHR();
        var theMethod = "POST";
        request.open(theMethod, url, true);
        request.onreadystatechange = (!handler && !errorHandler) ? function() {
        } : function() {
            if (request.readyState == 4) {
                if (request.status == 200 && handler) {
                    handler(request);
                } else if (errorHandler) {
                    errorHandler(request);
                }
            }
        };
        if (postBody && theMethod == "POST") {
            request.setRequestHeader('Content-Type',
                    'application/x-www-form-urlencoded; charset=ISO-8859-13');
        }
        request.send(postBody);
        return request;
    },

    setCookie : function(name, value, expires, path) {
        document.cookie = name + '=' + escape(value)
                + ((expires) ? '; expires=' + expires.toGMTString() : '')
                + ((path) ? '; path=' + path : '; path=/');
    },

    getCookie : function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') {
                c = c.substring(1,c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return unescape(c.substring(nameEQ.length,c.length));
            }
        }
        return null;
    }
};
