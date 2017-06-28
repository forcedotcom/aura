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
(function(){

    var priv = {
        errors : [],
        waits : [],
        currentWait : undefined,
        inProgress : -1, // -1:uninitialized, 0:complete, 1:tearing down, 2:running, 3+:waiting
        preErrors : [],
        preWarnings : [],
        failOnWarning : false,
        initTime : new Date().getTime(),
        timeoutTime : 0,
        elapsedTime : 0,
        suite : undefined,
        stages : undefined,
        cmp : undefined
    };
    
    var TestInstance = {};
    
    /**
     * Return whether the test is finished.
     *
     * @returns {Boolean} Returns true if the test has completed, or false otherwise.
     * @export
     * @function Test#isComplete
     */
    TestInstance.isComplete = function() {
        return priv.inProgress === 0;
    };
    
    /**
     * Get the list of errors seen by the test, not including any errors handled explicitly by the framework.
     *
     * @returns {string} Returns an empty string if no errors are seen, else a json encoded list of errors
     * @export
     * @function Test#getErrors
     */
    TestInstance.getErrors = function() {
        if (priv.errors.length > 0) {
            return JSON.stringify(priv.errors);
        } else {
            return "";
        }
    };

    /**
    * @description Assert that condition is truthy.
    *
    * @param {Object} condition The condition to evaluate
    * @param {String} assertMessage The message that is returned if the condition is not truthy
    *
    *
    * @example
    * assert("helloWorld"); // Positive
    * assert(null); // Negative
    * @export
    */
    TestInstance.assert = function(condition, assertMessage) {
        if (!condition) {
            TestInstance.fail(assertMessage, "\nExpected: {truthy} but Actual: {" + condition + "}");
        }
    };
    
    /**
    * Assert that the two values provided are equal.
    *
    * @param {Object}
    *            expected The argument to evaluate against actual
    * @param {Object}
    *            actual The argument to evaluate against expected
    * @param {String}
    *            assertMessage The message that is returned if the two values are not equal
    * @export
    * @function Test#assertEquals
    */
    TestInstance.assertEquals = function(expected, actual, assertMessage) {
       if (expected !== actual) {
           var extraMessage = "\nExpected: {" + expected + "} but Actual: {" + actual + "}";
           if (typeof expected !== typeof actual) {
               var expectedType = (expected === null) ? "null" : typeof expected;
               var actualType = (actual === null) ? "null" : typeof actual;
               extraMessage += "\nType Mismatch, Expected type: {" + expectedType + "} but Actual type: {" + actualType + "}";
           }
           TestInstance.fail(assertMessage, extraMessage);
       }
    };
    
    /**
    * Complement of assertEquals, throws Error if expected===actual.
    *
    * @param {Object}
    *            expected The argument to evaluate against actual
    * @param {Object}
    *            actual The argument to evaluate against expected
    * @param {String}
    *            assertMessage The message that is returned if the two values are equal
    * @export
    * @function Test#assertNotEquals
    */
    TestInstance.assertNotEquals = function(expected, actual, assertMessage) {
       if (expected === actual) {
           TestInstance.fail(assertMessage, "\nExpected values to not be equal but both were: {" + expected + "}");
       }
    };
    
    /**
    * Assert that a string starts with another.
    *
    * @param {Object}
    *            start The start string.
    * @param {Object}
    *            actual The string that is expected to start with the start string
    * @param {String}
    *            assertMessage The message that is returned if the 'actual' doesn't start with 'start'
    * @export
    * @function Test#assertStartsWith
    */
    TestInstance.assertStartsWith = function(start, actual, assertMessage) {
       if (!actual || !actual.indexOf || actual.indexOf(start) !== 0) {
           var actualStart = actual;
           if (actualStart.length > start.length + 20) {
               actualStart = actualStart.substring(0, start.length + 20) + "...";
           }
           TestInstance.fail(assertMessage, "\nExpected string to start with: {" + start + "} but Actual: {" + actualStart + "}");
       }
    };
    
    
    /**
     * Throw an Error, making a test fail with the specified message.
     *
     * @param {String}
     *            assertMessage Defaults to "Assertion failure", if assertMessage is not provided
     * @param {String}
     *            extraInfoMessage
     * @throws {Error}
     *             Throws error with a message
     * @export
     * @function Test#fail
     */
    TestInstance.fail = function(assertMessage, extraInfoMessage) {
        var msg = assertMessage || "Assertion failure.";
        if (extraInfoMessage) {
            msg += extraInfoMessage;
        }
        var error = new Error(msg);
        throw error;
    };
    
    /**
     * @description Asynchronously wait for a condition. Return a Promise that
     *              will resolve to the matching result of the condition if
     *              successful, or with a timeout error if the condition does
     *              not evaluate to a truthy result within the given period.
     * 
     * @param {Function}
     *            fn The function to evaluate periodically until it returns a truthy value.
     * @param {Integer}
     *            timeout The maximum time to wait, in milliseconds. Defaults to 10000.
     * @param {Integer}
     *            interval The interval, in milliseconds, between evaluations of the given function.  Defaults to 50.
     *            
     * @example waitFor(function(){
     *              return element.textContent === 'expected';
     *          }, 1000, 50).then(function(){
     *              // proceed with next steps
     *          }, function() {
     *              throw new Error("timed out waiting for element");
     *          });
     * 
     * @export
     * @function Test#waitFor
     */
    TestInstance.waitFor = function(fn, timeout, interval) {
        var endTime = new Date().getTime() + (timeout || 10000);
        interval = interval || 50;
        return new Promise(function(done, failed){
            (function poll(){
                var res = fn();
                if (res) {
                    done(res);
                } else if (new Date().getTime() < endTime) {
                    setTimeout(poll, interval);
                } else {
                    failed(new Error("Timed out after " + timeout + "ms waiting for: " + fn));
                }
            })();
        });
    };
    
    /**
     * Get the text content of a DOM node. Tries <code>textContent</code> followed by <code>innerText</code>, followed
     * by <code>nodeValue</code> to take browser differences into account.
     *
     * @param {Node} node The node to get the text content from
     * @returns {String} The text content of the specified DOM node or empty string if unable to extract text
     * 
     * @export
     * @function Test#getText
     */
    TestInstance.getText = function(node) {
        if (!node) {
            return "";
        }
    
        var t = node.textContent;
        if (t === undefined) {
            t = node.innerText || "";
        }
    
        // Older IE needs special handling
        if (t === "") {
            // Text nodes
            if (node.nodeType === 3) {
                return node.nodeValue;
            }
    
            // For old IE, if it's a <style> tag innerText doesnt work so try cssText
            if (node.tagName === "STYLE" && node.styleSheet !== undefined && node.styleSheet !== null) {
                return node.styleSheet.cssText || "";
            }
        }
        return t;
    };

    function logError(msg, e) {
        var err;
        var p, i;
    
        err = {
                "message" : msg
        };
        
        if (e) {
            err["message"] += ": " + e.toString();
            
            for (p in e) {
                if (p === "message") {
                    continue;   
                }
                err[p] = "" + e[p];
            }
        } 
    
        // Don't add duplicate entries
        for (i = 0; i < priv.errors.length; i++) {
            var existing = priv.errors[i]["message"];
            var newMsg = err["message"];
            if (newMsg.indexOf(existing) > -1) {
                priv.errors[i] = err;
                return;
            }
        }
    
        // Add current test state to all errors
        err["testState"] = TestInstance.getDump();
        priv.errors.push(err);
    };

    function logErrors(error, label, errorArray) {
        var i;
    
        if (errorArray !== null && errorArray.length > 0) {
            for (i = 0; i < errorArray.length; i++) {
                if (errorArray[i] !== undefined) {
                    if (error) {
                        logError(label + errorArray[i]);
                    } else if ($A && $A.log) {
                        $A.log(label + errorArray[i]);
                    }
                }
            }
        }
    };

    function print(value) {
        if (value === undefined) {
            return "undefined";
        } else if (value === null) {
            return "null";
        } else if (typeof value === "string") {
            return '"' + value + '"';
        } else {
            return value.toString();
        }
    }

/**
 * Provide some information about the current state of the TestInstance.
 * 
 * @export
 * @function Test#getDump
 */
TestInstance.getDump = function() {
    try {
        var status = "URL: " + window.location +  "\n";
        
        status += "Test status: ";
        if (priv.inProgress === -1) {
            status += "did not start\n";
        } else if (priv.inProgress === 0) {
            status += "completed\n";
        } else if (priv.inProgress === 1) {
            status += "tearing down\n";
        } else if (priv.inProgress >= 2) {
            status += "running\n";
        }
        status += "Elapsed time: ";
        status += priv.elapsedTime || (new Date().getTime() - priv.initTime);
        status += "ms\n";

        if (priv.errors.length > 0) {
            status += "Errors: {" + TestInstance.getErrors() + "}\n";
        }
        if (priv.preErrors && priv.preErrors.length > 0) {
            status += "Errors during init: {" + print(priv.preErrors)
                    + "}\n";
        }
        if (priv.currentWait) {
            var actual = priv.currentWait.actual;
            if (typeof actual === "function") {
                try {
                    actual = actual();
                } catch (e) {
                    actual = [ "<error evaluating>" ];
                }
            }
            if (priv.currentWait.failureMessage !== undefined && priv.currentWait.failureMessage !== null) {
                status += "Wait failure: {" + priv.currentWait.failureMessage
                        + "}\n";
            }
            status += "Waiting for: {" + print(priv.currentWait.expected)
                    + "} currently {" + print(actual) + "}\n";
            status += "Wait function: " + print(priv.currentWait.actual)
                    + "\n";
        }
        if (priv.lastStage) {
            status += "Last function: " + print(priv.lastStage) + "\n";
        }
        return status;
    } catch (e) {
        // Just in case
        return "Unhandled error retrieving dump:" + e.toString();
    }
};

    /**
     * Run the test
     *
     * @param {String}
     *            name The name of the test in the suite to run
     * @param {Object}
     *            testSuite The full test suite code
     * @param {Integer}
     *            timeoutOverride Optional. Use to increase the test timeout by specified time in seconds. If not set the
     *            test will use a default timeout of 10 seconds.
     *
     * @export
     * @function Test#run
     */
    TestInstance.run = function(name, testSuite, timeoutOverride) {
        // check if test has already started running, since frame loads from layouts may trigger multiple runs
        if (priv.inProgress >= 0) {
            return;
        }
        priv.inProgress = 2;
    
        if (!timeoutOverride) {
            timeoutOverride = 10;
        }
        priv.timeoutTime = priv.initTime + 1000 * timeoutOverride;
        priv.suite = testSuite;
    
        var continueRun = runInternal.bind(this, name);
        setTimeout(waitForRoot.bind(this, continueRun), 1);
    };

    function waitForRoot(callback) {
        if ($A.getRoot()) {
            setTimeout(callback, 1); // give browser a moment to settle down
            return;
        }
        setTimeout(waitForRoot.bind(this, callback), 50);
    };

    function continueWhenReady() {
        if (priv.inProgress < 2) {
            return;
        }
        if (priv.errors.length > 0) {
            doTearDown();
            return;
        }
        try {
            if ((priv.inProgress > 1) && (new Date().getTime() > priv.timeoutTime)) {
                throw new Error("Test timed out");
            }
            if (priv.inProgress > 2) {
                setTimeout(continueWhenReady, 50);
                return;
            }
            if (!priv.currentWait) {
                priv.currentWait = priv.waits.shift();
            }
            if (priv.currentWait) {
                var exp = priv.currentWait.expected;
                if (typeof exp === 'function') {
                    exp = exp();
                }
                var act = priv.currentWait.actual;
                if (typeof act === 'function') {
                    act = act();
                }
                if (exp === act) {
                    var callback = priv.currentWait.callback;
                    priv.currentWait = undefined;
                    if (callback) {
                        // Set the suite as scope for callback function.
                        // Helpful to expose test suite as 'this' in callbacks for addWaitFor
                        if (priv.doNotWrapInAuraRun) {
                            callback.call(priv.suite, priv.cmp);
                        } else {
                            $A.run(function() {
                                callback.call(priv.suite, priv.cmp);
                            });
                        }
                    }
                    setTimeout(continueWhenReady, 1);
                    return;
                } else {
                    setTimeout(continueWhenReady, 50);
                    return;
                }
            } else {
                if (priv.stages.length === 0) {
                    doTearDown();
                } else {
                    priv.lastStage = priv.stages.shift();
                    if (priv.doNotWrapInAuraRun) {
                        priv.lastStage.call(priv.suite, priv.cmp);
                    } else {
                        $A.run(function() {
                            priv.lastStage.call(priv.suite, priv.cmp);
                        });
                    }
                    setTimeout(continueWhenReady, 1);
                }
            }
        } catch (e) {
            if ($A && $A.auraError && e instanceof $A.auraError) {
                throw e;
            } else {
                logError("Test error", e);
                doTearDown();
            }
        }
    };

    function runInternal(name) {
        priv.cmp = $A.getRoot();
        $A.clientService.setCurrentAccess(priv.cmp);
        var useLabel = function(labelName) {
            var suiteLevel = priv.suite[labelName] || false;
            var testLevel = priv.suite[name][labelName];
            return (testLevel === undefined) ? suiteLevel : testLevel;
        };
    
        priv.failOnWarning = useLabel("failOnWarning");
        priv.doNotWrapInAuraRun = useLabel("doNotWrapInAuraRun");
    
        priv.stages = priv.suite[name]["test"];
        priv.stages = Object.prototype.toString.call(priv.stages) === '[object Array]' ? priv.stages : [ priv.stages ];
    
        var auraErrorsExpectedDuringInit = priv.suite[name]["auraErrorsExpectedDuringInit"] || [];
        var auraWarningsExpectedDuringInit = priv.suite[name]["auraWarningsExpectedDuringInit"] || [];
    
        try {
            if (priv.suite["setUp"]) {
                if (priv.doNotWrapInAuraRun) {
                    priv.suite["setUp"].call(priv.suite, priv.cmp);
                } else {
                    $A.run(function() {
                        priv.suite["setUp"].call(priv.suite, priv.cmp);
                    });
                }
            }
    
            logErrors(true, "Received unexpected error: ", priv.preErrors);
            logErrors(true, "Did not receive expected error during init: ", auraErrorsExpectedDuringInit);
            priv.preErrors = null;
    
            logErrors(TestInstance.failOnWarning, "Received unexpected warning: ", priv.preWarnings);
            logErrors(TestInstance.failOnWarning, "Did not receive expected warning during init: ",
                    auraWarningsExpectedDuringInit);
            priv.preWarnings = null;
    
        } catch (e) {
            logError("Error during setUp", e);
            doTearDown();
        }
    
        continueWhenReady();
    };

    function doTearDown() {
        // check if already tearing down
        if (priv.inProgress > 1) {
            priv.inProgress = 1;
        } else {
            return;
        }
        try {
            if (priv.suite && priv.suite["tearDown"]) {
                if (priv.doNotWrapInAuraRun) {
                    priv.suite["tearDown"].call(priv.suite, priv.cmp);
                } else {
                    $A.run(function() {
                        priv.suite["tearDown"].call(priv.suite, priv.cmp);
                    });
                }
            }
        } catch (e) {
            logError("Error during tearDown", e);
        }
        setTimeout(function() {
            priv.inProgress = 0;
            priv.elapsedTime = new Date().getTime() - priv.initTime;
        }, 100);
    };

    /**
     * Register a global error handler to catch uncaught javascript errors.
     * @export
     * @ignore
     */
    window.onerror = (function() {
        var origHandler = window.onerror;
        /** @inner */
        var newHandler = function(msg, url, line, col, e) {
            var error = {
                message : "Uncaught js error: " + msg
            };
            if (url) {
                error["url"] = url;
            }
            if (line) {
                error["line"] = line;
            }
            priv.errors.push(error);
            doTearDown();
        };
    
        return function() {
            if (origHandler) {
                origHandler.apply(this, arguments);
            }
            return newHandler.apply(this, arguments);
        };
    })();

    function initTest(){
        window.$A.test = TestInstance;
        if(window.$test) window.$test();
    }
    if (typeof Aura === "undefined" || !Aura.frameworkJsReady) {
        window.Aura || (window.Aura = {});
        window.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || [];
        window.Aura.beforeFrameworkInit.push(initTest);
    } else {
        initTest();
    }
})();