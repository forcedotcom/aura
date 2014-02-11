/*
 * Copyright (c) 2013, Salesforce.com. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/*jslint sub: true*/

/**
 * @define {!string}
 * @private
 */
var ROOT_NAMESPACE = "Perf";

/**
 * @namespace
 * @const
 * @type {!IPerf}
 */
var Perf = window[ROOT_NAMESPACE] = /** @lends {Perf} */ ({
	
	/**
	 * @type {!window.typePerfLogLevel}
	 * @expose
	 * @const
	 */
	currentLogLevel : PerfLogLevel.DISABLED,
    /**
     * @param {!string} id The id used to identify the mark.
     * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should
     * be logged at.
     * @return {!IPerf}
     * @expose
     */
    mark : function (id, logLevel) { return Perf; },
    /**
     * @param {!string} id This is the id associated with the mark that uses
     * the same id.
     * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should
     * be logged at.
     * @return {!IPerf}
     * @expose
     */
    endMark : function (id, logLevel) { return Perf; },
    /**
     * This method is used to the update the name of a mark
     *
     * @param {!string} oldName The id used to identify the old mark name.
     * @param {!string} newName The id used to identify the new mark name.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    updateMarkName : function (oldName, newName) { return Perf; },
    /**
     * Serializes a measure object to JSON.
     *
     * @param {!window.typejsonMeasure} measure The measure to serialize.
     * @return {!string} JSON-serialized version of the supplied measure.
     * @expose
     */
    measureToJson : function (measure) { return ""; },
    /**
     * Serializes timers to JSON.
     *
     * @param {boolean=} includeMarks
     * @return {!string} JSON-serialized version of supplied marks.
     * @expose
     */
    toJson : function (includeMarks) { return ""; },
    /**
     * @param {!string} timer_name The name of the timer to set.
     * @param {number=} timer_delta The time delta to set.
     * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults to PerfLogLevel.INTERNAL if left blank
     * @return {!IPerf}
     * @expose
     */
    setTimer : function (timer_name, timer_delta, logLevel) { return Perf; },
    /**
     * Get a JSON-serialized version of all existing timers and stats in POST friendly format.
     *
     * @return {!string} POST-friendly timers and stats.
     * @expose
     */
    toPostVar : function () { return ""; },
    /**
     * Returns all of the measures that have been captured
     *
     * @return {!Array.<window.typejsonMeasure>} all existing measures.
     * @expose
     */
    getMeasures : function () { return []; },
    /**
     * Returns the beaconData to piggyback on the next XHR call
     *
     * @return {?string} beacon data.
     * @expose
     */
    getBeaconData : function () { return null; },
    /**
     * Sets the beaconData to piggyback on the next XHR call
     *
     * @param {!string} beaconData
     * @expose
     */
    setBeaconData : function (beaconData) {},
    /**
     * Clears beacon data
     *
     * @expose
     */
    clearBeaconData : function () {},
    /**
     * Removes the existing timers
     *
     * @expose
     */
    removeStats : function () {},
    /**
     * Add a performance measurement from the server.
     * 
     * @param {!string} label
     * @param {!number} elapsedMillis
     * @return {!IPerf}
     * @expose
     */
    stat : function (label, elapsedMillis) { return Perf; },
    /**
     * Get the stored server side performance measures.
     *
     * @param {!string} label
     * @return {!string|number}
     * @expose
     */
    getStat : function (label) { return -1; },
    /**
     * Called when the page is ready to interact with. To support the existing Kylie.onLoad method.
     *
     * @expose
     */
    onLoad : function () {},
    /**
     * This method is used to mark the start of a transaction
     *
     * @param {!string} tName The id used to identify the transaction.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    startTransaction : function (tName) { return Perf; },
    /**
     * This method is used to mark the end of a transaction
     *
     * @param {!string} tName The id used to identify the transaction.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    endTransaction : function (tName) { return Perf; },
    /**
     * This method is used to the update the name of the
     * transaction
     *
     * @param {!string} oldName The id used to identify the old transaction name.
     * @param {!string} newName The id used to identify the new transaction name.
     * @return {!IPerf} for chaining methods
     * @expose
     */
    updateTransaction : function (oldName, newName) { return Perf; },
    /**
     * This method is used to figure if onLoad/page_ready has been fired or 
     * not
     *
     * @return {!boolean}
     * @expose
     */
    isOnLoadFired : function () { return false; },
    /**
     * @namespace
     * @type {!IPerf_util}
     * @const
     * @expose
     */
    util : /** @type {!IPerf_util} */ ({
        /**
         * Sets the roundtrip time cookie
         *
         * @param {!string=} name
         * @param {!string|number=} value
         * @param {Date=} expires
         * @param {string=} path
         * @expose
         */
        setCookie : function (name, value, expires, path) {}
    }),
    /**
     * Whether the full Kylie framework is loaded, as opposed to just the stubs.
     * 
     * @type {boolean}
     * @const
     */
    enabled: false
});