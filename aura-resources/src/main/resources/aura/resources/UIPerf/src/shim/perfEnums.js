/*
 * Copyright (c) 2013, Salesforce.com. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/*jshint sub:true*/

/**
 * The levels for logging performance m
 * 
 * @enum {{name: !string, value: !number}}
 * @expose
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
    },
    /** @expose */
    DISABLED : {
        name : "DISABLED",
        value : 4
    }
};

/**
 * Various Perf constants.
 *
 * @enum {!string}
 * @expose
 */
var PerfConstants = {
    /** @expose */
    PAGE_START_MARK : "PageStart",
    /** @expose */
    PERF_PAYLOAD_PARAM : "bulkPerf",
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
    Perf_LOAD_DONE : "loadDone"
};

/**
 * @enum {!string}
 * @expose
 */
PerfConstants.STATS = {
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
window["PerfConstants"] = PerfConstants;
window["PerfLogLevel"] = PerfLogLevel;