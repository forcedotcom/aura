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

/*jslint sub: true */

/**
 * Logger implementation providing log messages to subscribers
 *
 * Subscriptions are made individually to each log level
 *
 * @namespace
 * @constructor
 */
$A.ns.Logger = function() {
    this.subscribers = [];
    this.INFO = "INFO";
    this.WARNING = "WARNING";
    this.ASSERT = "ASSERT";
    this.ERROR = "ERROR";

    this.subscriptions = {};
    this.subscriptions[this.INFO] = 0;
    this.subscriptions[this.WARNING] = 0;
    this.subscriptions[this.ASSERT] = 0;
    this.subscriptions[this.ERROR] = 0;
};

/**
 * Info log
 *
 * @param {String} info message
 * @param {Error} [error] error
 */
$A.ns.Logger.prototype.info = function(info, error) {
    this.log(this.INFO, info, error);
};

/**
 * Warning log
 *
 * @param {String} warning message
 * @param {Error} [error] error
 */
$A.ns.Logger.prototype.warning = function(warning, error) {
    this.log(this.WARNING, warning, error);
};

/**
 * Checks condition and logs message when condition is falsy
 *
 * @param {Boolean} condition check
 * @param {String} assertMessage message when assertion fails
 */
$A.ns.Logger.prototype.assert = function(condition, assertMessage) {
    if (!condition) {
        var message = "Assertion Failed!: " + assertMessage + " : " + condition;
        this.log(this.ASSERT, message);
    }
};

/**
 * Error log and shows dialog window with error message. Also displays stack unless in production
 *
 * @param {String} msg error message
 * @param {Error} [e] error
 */
$A.ns.Logger.prototype.error = function(msg, e){
    var logMsg = msg || "";
    var dispMsg;

    if (!$A.util.isString(msg)) {
        e = msg;
        logMsg = "";
        msg = "Unknown Error";
    }
    if (!e) {
        e = undefined;
    } else if (!$A.util.isError(e)) {
        // Somebody has thrown something bogus, or we're on IE, but either way we
        // should do what we can...
        if ($A.util.isObject(e) && e.message) {
            var stk = e.stack;
            e = new Error("caught " + e.message);
            if (stk) {
                e.stack = stk;
            }
        } else {
            e = new Error("caught " + $A.util.json.encode(e));
        }
    }
    if (!logMsg.length) {
        logMsg = "Unknown Error";
    }
    if (e && !$A.util.isUndefinedOrNull(e.message)) {
        logMsg = logMsg + " : " + e.message;
    }
    dispMsg = logMsg;
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    //
    // Error objects in older versions of IE are represented as maps with multiple entries containing the error message
    // string. Checking that the object here is not an Error object prevents the error message from being displayed
    // multiple times.
    //
    if ($A.util.isObject(e) && !$A.util.isError(e)) {
        for(var k in e) {
            try {
                var val = e[k];

                if ($A.util.isString(val)) {
                    if (dispMsg === "Unknown Error") {
                        dispMsg = val;
                    } else {
                        dispMsg = dispMsg + '\n' + val;
                    }
                    msg = dispMsg;
                }
            } catch (e2) {
                // Ignore serialization errors
            }
        }
    }
    var stack = this.getStackTrace(e);
    if (stack) {
        dispMsg = dispMsg + "\n" + stack.join("\n");
    }
    //#end
    $A.message(dispMsg);
    if (!$A.initialized) {
        $A["hasErrors"] = true;
    }
    this.log(this.ERROR, logMsg, e);
};

/**
 * Checks for subscribers and notifies
 *
 * @param {String} level log level
 * @param {String} message log message
 * @param {Error} [error]
 */
$A.ns.Logger.prototype.log = function(level, message, error) {
    if (this.hasSubscriptions(level)) {
        this.notify(level, message, error);
    }
};

/**
 * Loops through subscribers and applies arguments to provider callback
 *
 * @param {String} level log level
 * @param {String} message log message
 * @param {Error} [error]
 */
$A.ns.Logger.prototype.notify = function(level, msg, error) {
    var subsLength = this.subscribers.length;
    for (var i = 0; i < subsLength; i++) {
        var sub = this.subscribers[i];
        if (sub.level === level) {
            sub.fn.apply(undefined, [level, msg, error]);
        }
    }
};

/**
 * Returns the stack trace, including the functions on the stack if available (Error object varies across browsers).
 * Values are not logged.
 *
 * @param {Error} e error
 * @param {Number} [remove]
 * @returns {String|null} stack
 */
$A.ns.Logger.prototype.getStackTrace = function(e, remove) {
    var stack = undefined;

    if (!remove) {
        remove = 0;
    }
    if (!e || !e.stack) {
        try {
            throw new Error("foo");
        } catch (f) {
            e = f;
            remove += 2;
        }
    }
    if (e && e.stack) {
        stack = e.stack;
    }
    if (stack) {
        var ret = stack.replace(/(?:\n@:0)?\s+$/m, '');
        ret = ret.replace(new RegExp('^\\(', 'gm'), '{anonymous}(');
        ret = ret.split("\n");
        if (remove !== 0) {
            ret.splice(0,remove);
        }
        return ret;
    }
    return null;
};

/**
 * Stringify a log message.
 *
 * @param {String} logMsg message
 * @param {Error} error
 * @param {Array} trace
 * @returns {String} string log
 */
$A.ns.Logger.prototype.stringVersion = function(logMsg, error, trace) {
    var stringVersion = !$A.util.isUndefinedOrNull(logMsg) ? logMsg : "" ;
    if (!$A.util.isUndefinedOrNull(error) && !$A.util.isUndefinedOrNull(error.message)) {
        stringVersion += " : " + error.message;
    }
    if (!$A.util.isUndefinedOrNull(trace)) {
        stringVersion += "\nStack: " + trace.join("\n");
    }
    return stringVersion;
};

/**
 * Adds subscriber. Callback function will be called when log of level specified occurs.
 * Each level requires a subscription.
 *
 * @param {String} level log level
 * @param {Function} callback function
 */
$A.ns.Logger.prototype.subscribe = function(level, callback) {
    level = level.toUpperCase();
    if (this.isValidSubscriber(level, callback)) {
        this.subscribers.push({
            level: level,
            fn: callback
        });
        this.adjustSubscriptions(level, 1);
    }
};

/**
 * Removes subscription. Each level needs to be unsubscribed separately
 *
 * @param {String} level log level
 * @param {Function} callback function
 */
$A.ns.Logger.prototype.unsubscribe = function(level, callback) {
    level = level.toUpperCase();
    if (this.isValidSubscriber(level, callback)) {
        var subsLength = this.subscribers.length;
        for (var i = 0; i < subsLength; i++) {
            var sub = this.subscribers[i];
            if (sub.level === level && sub.fn === callback) {
                this.subscribers.splice(i, 1);
            }
        }
        this.adjustSubscriptions(level, -1);
    }
};

/**
 * Adjust log level subscription numbers
 *
 * @param {String} level level to adjust
 * @param {Number} adjustment Number to adjust subscription
 */
$A.ns.Logger.prototype.adjustSubscriptions = function(level, adjustment) {
    this.subscriptions[level] += adjustment;
};

/**
 * Checks and throws Error if not valid subscriber
 *
 * @param {String} level log level
 * @param {Function} callback function
 * @returns {boolean} Valid subscriber
 */
$A.ns.Logger.prototype.isValidSubscriber = function(level, callback) {
    if (this.isValidLevel(level) && typeof callback === "function") {
        return true;
    }
    throw new Error("Logging callback must be a function");
};

/**
 * Checks whether level is valid
 * @param {String} level log level
 * @returns {boolean}
 */
$A.ns.Logger.prototype.isValidLevel = function(level) {
    if (level === this.INFO ||
        level === this.WARNING ||
        level === this.ASSERT ||
        level === this.ERROR) {
        return true;
    }
    throw new Error("Please specify valid log level: 'INFO', 'WARNING', 'ASSERT', 'ERROR'");
};

/**
 * Returns number of subscriptions for given level
 *
 * @param {String} level
 * @returns {boolean} Whether there are subscriptions to given level
 */
$A.ns.Logger.prototype.hasSubscriptions = function(level) {
    level = level.toUpperCase();
    if (this.isValidLevel(level)) {
        return this.subscriptions[level] > 0;
    }
};

$A.ns.Logger.prototype["getStackTrace"] = $A.ns.Logger.prototype.getStackTrace;
$A.ns.Logger.prototype["stringVersion"] = $A.ns.Logger.prototype.stringVersion;
$A.ns.Logger.prototype["subscribe"] = $A.ns.Logger.prototype.subscribe;
$A.ns.Logger.prototype["unsubscribe"] = $A.ns.Logger.prototype.unsubscribe;
$A.ns.Logger.prototype["hasSubscriptions"] = $A.ns.Logger.prototype.hasSubscriptions;
$A.ns.Logger.prototype["info"] = $A.ns.Logger.prototype.info;
$A.ns.Logger.prototype["warning"] = $A.ns.Logger.prototype.warning;
$A.ns.Logger.prototype["error"] = $A.ns.Logger.prototype.error;
$A.ns.Logger.prototype["assert"] = $A.ns.Logger.prototype.assert;