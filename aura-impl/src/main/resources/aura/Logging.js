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

(function(){

    //#if {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG"]}
    /**
     * Allow testing for warnings
     */
    function testingWarningLog(level, msg, error) {
        $A.test.auraWarning(msg);
    };

    /**
     * Allow testing for errors
     */
    function testingErrorLog(level, msg, error) {
        $A.test.auraError(msg);
    };

    $A.logger.subscribe("WARNING", testingWarningLog);
    $A.logger.subscribe("ERROR", testingErrorLog);
    //#end

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    /**
     * Prints log to both the console (if available), and to the aura debug component unless in production
     */
    function devDebugConsoleLog(level, message, error) {

        var stringVersion = null;
        if (!$A.util.isUndefinedOrNull(message)) {
            stringVersion = level + ": " + message;
        }
        if (!$A.util.isUndefinedOrNull(error) && !$A.util.isUndefinedOrNull(error.message)) {
            stringVersion += " : " + error.message;
        }

        var trace;
        if ($A.util.isError(error) || level == "ERROR") {
            // remove some junk logger stack
            trace = $A.logger.getStackTrace(error, 4);
        } else if (error && error.stack) {
            trace = error.stack;
        }

        var logMsg = level + ": " + (!$A.util.isUndefinedOrNull(message) ? message : "");

        if (window["console"]) {
            var console = window["console"];
            if (console["group"]) {
                console["group"](logMsg);
                if (!$A.util.isUndefinedOrNull(error)) {
                    console["debug"](error);
                } else {
                    console["debug"](message);
                }
                if (trace) {
                    console["group"]("stack");
                    for ( var i = 0; i < trace.length; i++) {
                        console["debug"](trace[i]);
                    }
                    console["groupEnd"]();
                }
                console["groupEnd"]();
            } else {
                stringVersion = $A.logger.stringVersion(logMsg, error, trace);
                if (console["debug"]) {
                    console["debug"](stringVersion);
                } else if (console["log"]) {
                    console["log"](stringVersion);
                }
            }
        }

        // sending logging info to debug tool if enabled
        if(!$A.util.isUndefinedOrNull($A.util.getDebugToolComponent())) {
            if ($A.util.isUndefinedOrNull(stringVersion)) {
                if ($A.util.isUndefinedOrNull(trace)) {
                    trace = $A.logger.getStackTrace(error);
                }
                stringVersion = $A.logger.stringVersion(logMsg, error, trace);
            }
            var debugLogEvent = $A.util.getDebugToolsAuraInstance().get("e.aura:debugLog");
            debugLogEvent.setParams({"type" : level, "message" : stringVersion});
            debugLogEvent.fire();
        }
    }

    /**
     * Throws error and show error dialog for failed assertion unless in production
     */
    function devAssertError(level, message, e) {
        $A.trace();
        var elt = $A.util.getElement("auraErrorMessage");
        if (elt) {
            elt.innerHTML = message;
            $A.util.removeClass(document.body, "loading");
            $A.util.addClass(document.body, "auraError");
        } else {
            alert(message);
        }
        throw new Error(message);
    }

    $A.logger.subscribe("INFO", devDebugConsoleLog);
    $A.logger.subscribe("WARNING", devDebugConsoleLog);
    $A.logger.subscribe("ERROR", devDebugConsoleLog);
    $A.logger.subscribe("ASSERT", devAssertError);

    //#end

})();
