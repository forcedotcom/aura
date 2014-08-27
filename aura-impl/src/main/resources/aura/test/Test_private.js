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
/*jslint sub:true */

$A.ns.Test.prototype.putMessage = function(pre, expected, msg) {
    for (var i = 0; i < expected.length; i++) {
        if (expected[i] === undefined) {
            continue;
        }
        if (msg.indexOf(expected[i]) != -1) {
            expected[i] = undefined;
            return true;
        }
    }
    if (pre !== null) {
        pre.push(msg);
        return true;
    }
    return false;
};

$A.ns.Test.prototype.expectMessage = function(pre, expected, msg) {
    if (pre !== null) {
        for (var i = 0; i < pre.length; i++) {
            if (pre[i] === undefined) {
                continue;
            }
            if (pre[i].indexOf(msg) === 0) {
                pre[i] = undefined;
                return;
            }
        }
    }
    expected.push(msg);
};

/**
 * Set any common entries in the two arrays to undefined.
 * 
 * This is used to compare two arrays of error messages, leaving only unexpected errors received (in the pre array)
 * and expected errors not received (in the expected array).
 * 
 * @private
 */
$A.ns.Test.prototype.clearExpected = function(pre, expected) {
    for (var i = 0; i < pre.length; i++) {
        for (var j = 0; j < expected.length; j++) {
            if (expected[j] !== undefined && pre[i].indexOf(expected[j]) !== -1) {
                pre[i] = undefined;
                expected[j] = undefined;
                break;
            }
        }
    }
};

/**
 * Register a global error handler to catch uncaught javascript errors.
 * @ignore
 */
window.onerror = (function(){
    var origHandler = window.onerror;
    /** @inner */
    var newHandler = function(msg, url, line){
        var error = { message: "Uncaught js error: " + msg };
        if(url){
            error["url"] = url;
        }
        if(line){
            error["line"] = line;
        }
        $A.ns.Test.prototype.errors.push(error);
    };

    if(origHandler) {
        return function(){ return origHandler.apply(this, arguments) || newHandler.apply(this, arguments); };
    } else {
        return newHandler;
    }
})();

/**
 * Used to keep track of errors happening in test modes.
 * @private
 */
$A.ns.Test.prototype.logError = function(msg, e){
    var errors = $A.ns.Test.prototype.errors;
    var err;
    var p;

    if (e) {
        err = { "message": msg + ": " + (e.message || e.toString()) };
        for (p in e){
            if(p=="message"){
                continue;
            }
            err[p] = "" + e[p];
        }
    } else {
        err = { "message": msg };
    }
    errors.push(err);
};

/**
 * Tear down a test.
 *
 * @private
 */
$A.ns.Test.prototype.doTearDown = function() {
    var i;

    // check if already tearing down
    if(this.inProgress > 1){
        this.inProgress = 1;
    }else {
        return;
    }
    try {
        for (i = 0; i < this.cleanups.length; i++) {
            this.cleanups[i]();
        }
    } catch(ce){
        this.logError("Error during cleanup", ce);
    }
    try{
        if(this.suite["tearDown"]){
            this.suite["tearDown"].call(this.suite, this.cmp);
        }
        var that = this;
        setTimeout(function(){that.inProgress--;}, 100);
    }catch(e){
        this.logError("Error during tearDown", e);
        this.inProgress = 0;
    }
};

$A.ns.Test.prototype.logErrors = function(error, label, errorArray) {
    var i;

    if (errorArray !== null && errorArray.length > 0) {
        for (i = 0; i < errorArray.length; i++) {
            if (errorArray[i] !== undefined) {
                if (error) {
                    this.logError(label+errorArray[i]);
                } else {
                    $A.log(label+errorArray[i]);
                }
            }
        }
    }
};
    
/**
 * Periodic callback to handle continuing operations.
 *
 * @private
 */
$A.ns.Test.prototype.continueWhenReady = function() {
    var that = this;
    var internalCWR = function () {
        that.continueWhenReady();
    };
    if (this.inProgress < 2) {
        return;
    }
    var errors = $A.ns.Test.prototype.errors;
    if(errors.length > 0){
        this.doTearDown();
        return;
    }
    try{
        if((this.inProgress > 1) && (new Date().getTime() > this.timeoutTime)){
            if(this.waits.length > 0){
                var texp = this.waits[0].expected;
                if($A.util.isFunction(texp)){
                    texp = texp().toString();
                }
                var tact = this.waits[0].actual;
                var val = tact;
                if($A.util.isFunction(tact)){
                    val = tact().toString();
                    tact = tact.toString();
                }
                var failureMessage = "";
                if(!$A.util.isUndefinedOrNull(this.waits[0].failureMessage)){
                    failureMessage = "; Failure Message: " + this.waits[0].failureMessage;
                }
                throw new Error("Test timed out waiting for: " + tact + "; Expected: " + texp + "; Actual: " + val + failureMessage);
            }else{
                throw new Error("Test timed out");
            }
        }
        if(this.inProgress > 2){
            setTimeout(internalCWR, 200);
        }else{
            if(this.waits.length > 0){
                var exp = this.waits[0].expected;
                if($A.util.isFunction(exp)){
                    exp = exp();
                }
                var act = this.waits[0].actual;
                if($A.util.isFunction(act)){
                    act = act();
                }
                if(exp === act){
                    var callback = this.waits[0].callback;
                    if(callback){
                        //Set the suite as scope for callback function.
                        //Helpful to expose test suite as 'this' in callbacks for addWaitFor
                        callback.call(this.suite, this.cmp);
                    }
                    this.waits.shift();
                    setTimeout(internalCWR, 1);
                }else{
                    setTimeout(internalCWR, 200);
                }
            } else {
                this.logErrors(true, "Did not receive expected error: ",this.expectedErrors);
                this.expectedErrors = [];

                this.logErrors(true, "Did not receive expected warning: ",this.expectedWarnings);
                this.expectedWarnings = [];

                if (this.stages.length === 0){
                    this.doTearDown();
                } else {
                    this.lastStage = this.stages.shift();
                    this.lastStage.call(this.suite, this.cmp);
                    setTimeout(internalCWR, 1);
                }
            }
        }
    }catch(e){
        if(this.lastStage) {
            e["lastStage"] = this.lastStage;
        }
        this.logError("Test error", e);
        this.doTearDown();
    }
};


/**
 * Provide some information about the current state of the test.
 *
 * This is used by webdriver to get information to display.
 *
 * @private
 */
$A.ns.Test.prototype.getDump = function() {
    var status = "";
    var errors = $A.ns.Test.prototype.errors;
    if (errors.length > 0) {
        status += "errors {" + $A.test.print($A.test.getErrors()) + "} ";
    }
    if (this.waits.length > 0 ) {
        var actual;
        try {
            actual = this.waits[0].actual();
        } catch (ignore) {}
        var failureMessage = "";
        if(!$A.util.isUndefinedOrNull(this.waits[0].failureMessage)){
        	failureMessage = " Failure Message: {" + this.waits[0].failureMessage + "}";
        }
        status += "waiting for {" + $A.test.print(this.waits[0].expected) + "} currently {" + $A.test.print(actual) + "}" + failureMessage + " from {" + $A.test.print(this.waits[0].actual) + "} after {" + $A.test.print(this.lastStage) + "} ";
    } else if (!$A.util.isUndefinedOrNull(this.lastStage)) {
        status += "executing {" + $A.test.print(this.lastStage) + "} ";
    }
    return status;
};

/**
 * Set up AppCache event listeners. Not a complete set of events, but all the ones we care about in our current tests.
 */
$A.ns.Test.prototype.appCacheEvents = (function() {
    var appCacheEvents = [];

    var handleAppcacheChecking = function() {
        appCacheEvents.push("checking");
    };

    var handleAppcacheProgress = function() {
        appCacheEvents.push("progress");
    };

    var handleAppcacheDownloading = function() {
        appCacheEvents.push("downloading");
    };

    var handleAppcacheCached = function() {
        appCacheEvents.push("cached");
    };

    var handleAppcacheError = function() {
        appCacheEvents.push("error");
    };

    if (window.applicationCache && window.applicationCache.addEventListener) {
        window.applicationCache.addEventListener("checking", handleAppcacheChecking, false);
        window.applicationCache.addEventListener("progress", handleAppcacheProgress, false);
        window.applicationCache.addEventListener("downloading", handleAppcacheDownloading, false);
        window.applicationCache.addEventListener("cached", handleAppcacheCached, false);
        window.applicationCache.addEventListener("error", handleAppcacheError, false);
    }

    return appCacheEvents;
})();

