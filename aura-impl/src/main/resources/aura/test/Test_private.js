/*
 * Copyright (C) 2012 salesforce.com, inc.
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

var priv = {
        /* Complete and errors are used in case Tests invoke actions on the server. Such actions have callback functions. These
         * two variables help in accounting for assertions in the call back functions.
         */
        waits : [],
        complete : -1, // -1:uninitialized, 0:complete, 1:tearing down, 2:running, 3+:waiting
        errors : [],
        timeoutTime : 0,
        appCacheEvents : [], // AppCache events in order, as they are picked up

        handleAppcacheChecking : function() {
            priv.appCacheEvents.push("checking");
        },

        handleAppcacheProgress : function() {
            priv.appCacheEvents.push("progress");
        },

        handleAppcacheDownloading: function() {
            priv.appCacheEvents.push("downloading");
        },

        handleAppcacheCached: function() {
            priv.appCacheEvents.push("cached");
        },

        handleAppcacheError: function() {
            priv.appCacheEvents.push("error");
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
        priv.errors.push(error);
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
function logError(msg, e){
    var p, err = { "message": msg + ": " + (e.message || e.toString()) };
    for (p in e){
        if(p=="message"){
            continue;
        }
        err[p] = "" + e[p];
    }
    priv.errors.push(err);
}

/**
 * Run the test
 * @private
 */
function run(name, code, count){
    // check if test has already started running, since frame loads from layouts may trigger multiple runs
    if(priv.complete >= 0){
        return;
    }
    priv.complete = 2;
    priv.timeoutTime = new Date().getTime() + 5000 * count;
    if(!count){
        count = 1;
    }
    var cmp = $A.getRoot();
    var suite = aura.util.json.decode(code);
    var stages = suite[name]["test"];
    stages = $A.util.isArray(stages) ? stages : [stages];

    /** @inner */
    var doTearDown = function() {
        // check if already tearing down
        if(priv.complete > 1){
            priv.complete = 1;
        }else {
            return;
        }
        try{
            if(suite["tearDown"]){
                suite["tearDown"].call(suite, cmp);
            }
            setTimeout(function(){priv.complete--;}, 100);
        }catch(e){
            logError("Error during tearDown", e);
            priv.complete = 0;
        }
    };
    
    /** @inner */
    var continueWhenReady = function() {
        if(priv.complete < 2){
            return;
        }
        if(priv.errors.length > 0){
            doTearDown();
            return;
        }
        try{
            if((priv.complete > 1) && (new Date().getTime() > priv.timeoutTime)){
                if(priv.waits.length > 0){
                    var texp = priv.waits[0].expected;
                    if($A.util.isFunction(texp)){
                        texp = texp().toString();
                    }
                    var tact = priv.waits[0].actual;
                    var val = tact;
                    if($A.util.isFunction(tact)){
                        val = tact().toString();
                        tact = tact.toString();
                    }
                    var failureMessage = "";
                    if(!$A.util.isUndefinedOrNull(priv.waits[0].failureMessage)){
                    	failureMessage = "; Failure Message: " + priv.waits[0].failureMessage;
                    }
                    throw new Error("Test timed out waiting for: " + tact + "; Expected: " + texp + "; Actual: " + val + failureMessage);
                }else{
                    throw new Error("Test timed out");
                }
            }
            if(priv.complete > 2){
                setTimeout(continueWhenReady, 200);
            }else{
                if(priv.waits.length > 0){
                    var exp = priv.waits[0].expected;
                    if($A.util.isFunction(exp)){
                        exp = exp();
                    }
                    var act = priv.waits[0].actual;
                    if($A.util.isFunction(act)){
                        act = act();
                    }
                    if(exp === act){
                        var callback = priv.waits[0].callback;
                        if(callback){
                            //Set the suite as scope for callback function. Helpful to expose test suite as 'this' in callbacks for addWaitFor
                            callback.call(suite);
                        }
                        priv.waits.shift();
                        setTimeout(continueWhenReady, 1);
                    }else{
                        setTimeout(continueWhenReady, 200);
                    }
                }else if(stages.length === 0){
                    doTearDown();
                }else{
                    priv.lastStage = stages.shift();
                    priv.lastStage.call(suite, cmp);
                    setTimeout(continueWhenReady, 1);
                }
            }
        }catch(e){
            if(priv.lastStage) {
                e["lastStage"] = priv.lastStage;
            }
            logError("Test error", e);
            doTearDown();
        }
    };
    try {
        if(suite["setUp"]){
            suite["setUp"].call(suite, cmp);
        }
    }catch(e){
        logError("Error during setUp", e);
        doTearDown();
    }
    setTimeout(continueWhenReady, 1);
}

/**
 * Provide some information about the current state of the test.
 * @private
 */
function getDump() {
    var status = "";
    if (priv.errors.length > 0) {
        status += "errors {" + $A.test.print($A.test.getErrors()) + "} ";
    }
    if (priv.waits.length > 0 ) {
        var actual;
        try {
            actual = priv.waits[0].actual();
        } catch (e) {}
        var failureMessage = "";
        if(!$A.util.isUndefinedOrNull(priv.waits[0].failureMessage)){
        	failureMessage = " Failure Message: {" + priv.waits[0].failureMessage + "}";
        }
        status += "waiting for {" + $A.test.print(priv.waits[0].expected) + "} currently {" + $A.test.print(actual) + "}" + failureMessage + " from {" + $A.test.print(priv.waits[0].actual) + "} after {" + $A.test.print(priv.lastStage) + "} ";
    } else if (!$A.util.isUndefinedOrNull(priv.lastStage)) {
        status += "executing {" + $A.test.print(priv.lastStage) + "} ";
    }
    return status;
}

/**
 * Set up AppCache event listeners. Not a complete set of events, but all the ones we care about in our current tests.
 */
if (window.applicationCache && window.applicationCache.addEventListener) {
    window.applicationCache.addEventListener("checking", priv.handleAppcacheChecking, false);
    window.applicationCache.addEventListener("progress", priv.handleAppcacheProgress, false);
    window.applicationCache.addEventListener("downloading", priv.handleAppcacheDownloading, false);
    window.applicationCache.addEventListener("cached", priv.handleAppcacheCached, false);
    window.applicationCache.addEventListener("error", priv.handleAppcacheError, false);
}
