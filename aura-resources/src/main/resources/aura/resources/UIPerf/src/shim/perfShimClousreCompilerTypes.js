/*
 * Copyright (c) 2013, Salesforce.com. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/*jshint expr:true*/

/** This file is used for the closure compiler in advanced mode to define custom data types and allows for better minification and type checking */

/** @typedef {{name: !string, value: !number}} */
window.typePerfLogLevel;

/** @typedef {{measure: !string, mark: !string, et: !number, rt: !number}} */
window.typejsonMeasure;

/**
 * The interface used with the Perf object.
 *
 * @interface
 */
function IPerf() {}

/**
 * @type {!window.typePerfLogLevel}
 * @const
 */
IPerf.prototype.currentLogLevel;

/**
 * @param {!string} id The id used to identify the mark.
 * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at.
 * @return {!IPerf}
 */
IPerf.prototype.mark;
/**
 * @param {!string} id This is the id associated with the mark that uses the same id.
 * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at.
 * @return {!IPerf}
 */
IPerf.prototype.endMark;
/**
 * This method is used to the update the name of a mark
 *
 * @param {!string} oldName The id used to identify the old mark name.
 * @param {!string} newName The id used to identify the new mark name.
 * @return {!IPerf} for chaining methods
 * @expose
 */
IPerf.prototype.updateMarkName;
/**
 * Serializes a measure object to JSON.
 * 
 * @param {!window.typejsonMeasure} measure The measure to serialize.
 * @return {!string} JSON-serialized version of the supplied marks.
 */
IPerf.prototype.measureToJson;
/**
 * Serializes timers to JSON.
 * 
 * @param {boolean=} includeMarks
 * @return {!string} JSON-serialized version of marks.
 */
IPerf.prototype.toJson;
/**
 * @param {!string} timer_name The name of the timer to set.
 * @param {!number} timer_delta The delta of timestamps to set.
 * @param {string|window.typePerfLogLevel=} logLevel The level at which this mark should be logged at. Defaults to PerfLogLevel.INTERNAL if left blank
 * @return {!IPerf}
 */
IPerf.prototype.setTimer;
/**
 * Get a JSON-serialized version of all existing timers and stats in POST friendly format.
 * 
 * @return {!string} POST-friendly timers and stats.
 */
IPerf.prototype.toPostVar;
/**
 * Returns all of the measures that have been captured
 * 
 * @return {!Array.<!window.typejsonMeasure>} all existing measures.
 */
IPerf.prototype.getMeasures;
/**
 * Returns the beaconData to piggyback on the next XHR call
 * 
 * @return {?string} beacon data.
 */
IPerf.prototype.getBeaconData;
/**
 * Sets the beaconData to piggyback on the next XHR call
 * 
 * @param {!string} beaconData
 */
IPerf.prototype.setBeaconData;
/**
 * Clears beacon data.
 * 
 * @type {function()}
 */
IPerf.prototype.clearBeaconData;
/**
 * Removes stats.
 * 
 * @type {function()}
 */
IPerf.prototype.removeStats;
/**
 * Add a performance measurement from the server.
 * 
 * @param {!string} label
 * @param {!number} elapsedMillis
 * @return {!IPerf}
 */
IPerf.prototype.stat;
/**
 * Get the stored server side performance measures.
 * 
 * @param {!string} label
 * @return {!string|number}
 */
IPerf.prototype.getStat;
/**
 * Called when the page is ready to interact with. To support the existing Kylie.onLoad method.
 * 
 * @type {function()}
 */
IPerf.prototype.onLoad;
/**
 * This method is used to mark the start of a transaction
 * 
 * @param {!string} tName The id used to identify the transaction.
 * @return {!IPerf} for chaining methods
 */
IPerf.prototype.startTransaction;
/**
 * This method is used to mark the end of a transaction
 * 
 * @param {!string} tName The id used to identify the transaction.
 * @return {!IPerf} for chaining methods
 */
IPerf.prototype.endTransaction;
/**
 * This method is used to the update the name of the transaction
 * 
 * @param {!string} oldName The id used to identify the old transaction name.
 * @param {!string} newName The id used to identify the new transaction name.
 * @return {!IPerf} for chaining methods
 */
IPerf.prototype.updateTransaction;

/**
 * Whether the full Kylie framework is loaded, as opposed to just the stubs.
 * 
 * @type {boolean}
 * @const
 */
IPerf.prototype.enabled;

/**
 * @interface
 */
function IPerf_util() {}

/**
 * Utility functions
 * 
 * @type {IPerf_util}
 */
IPerf.prototype.utils;

/**
 * Sets the roundtrip time cookie
 *
 * @param {!string} name
 * @param {!string|number} value
 * @param {Date=} expires
 * @param {string=} path
 */
IPerf_util.prototype.setCookie;