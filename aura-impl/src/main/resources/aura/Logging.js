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

/*jslint sub: true*/
/*eslint-disable no-alert, no-console */

(function(){
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    /**
     * Prints log to both the console (if available), and to the aura debug component unless in production
     */
    function devDebugConsoleLog(level, message, error) {
        var stringVersion = null;
        var showTrace = true;
        var trace;
        var logMsg = level + ": " + (!$A.util.isUndefinedOrNull(message) ? message : "");

        if (!$A.util.isUndefinedOrNull(message)) {
            stringVersion = level + ": " + message;
        }

        if (!$A.util.isUndefinedOrNull(error) && !$A.util.isUndefinedOrNull(error.message)) {
            stringVersion += " : " + error.message;
        }

        if (error || level === "ERROR") {
            trace = $A.logger.getStackTrace(error);
        }

        if (window["console"]) {
            var console = window["console"];
            var filter = level === "WARNING" ? "warn" : level.toLowerCase();
            if (console[filter]) {
                console[filter](message);
                if (!$A.util.isUndefinedOrNull(error)) {
                    console[filter](error);
                    showTrace = !(error.stack || error.stackTrace);
                }
                if (showTrace && trace) {
                    for ( var j = 0; j < trace.length; j++) {
                        console[filter](trace[j]);
                    }
                }
            } else if (console["group"]) {
                console["group"](logMsg);
                console["debug"](message);
                if (!$A.util.isUndefinedOrNull(error)) {
                    console["debug"](error);
                    showTrace = !(error.stack || error.stackTrace);
                }
                if (showTrace && trace) {
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

    $A.logger.subscribe("INFO", devDebugConsoleLog);
    $A.logger.subscribe("WARNING", devDebugConsoleLog);
    $A.logger.subscribe("ERROR", devDebugConsoleLog);
    //#end

    $A.logger.subscribe("ASSERT", function(level, message) {
        throw new $A.auraError(message);
    });

    //#if {"modes" : ["PRODUCTIONDEBUG"]}
    /**
     * $A.warning() will log to console in proddebug
     */
    $A.logger.subscribe("WARNING", function(level, message, error) {
        if(window["console"]){
            window["console"].warn(level+": "+(message||error&&error.message));
        }
    });
    //#end

    function handleError(message, e) {
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        devDebugConsoleLog("ERROR", message, e);
        //#end
        var dispMsg = message;
        var evtArgs = {"message":dispMsg,"error":null,"auraError":null};

        if (e) {
            if (e["handled"]) {
                return;
            } else {
                e["handled"] = true;
            }

            if (e["name"] === "AuraError") {
                var format = "Something has gone wrong. {0}.\nPlease try again.\n{1}";
                var displayMessage = e.message || e.name;
                //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
                displayMessage += "\n" + e.stackTrace;
                //#end
                dispMsg = $A.util.format(format, displayMessage, e.errorCode+"");
            }

            if (e["name"] === "AuraFriendlyError") {
                evtArgs = {"message":e["message"],"error":e["name"],"auraError":e};
            }
            else {
                // use null error string to specify non auraFriendlyError type.
                evtArgs = {"message":dispMsg,"error":null,"auraError":e};
            }
        }

        if ($A.initialized) {
            $A.getEvt("aura:systemError").fire(evtArgs);
        } else {
            if ($A.showErrors()) {
                $A.message(dispMsg);
            }
        }
    }

    $A.logger.subscribe("ERROR", function(level, message, e) {
        handleError(message, e);
    });

    window.onerror = (function() {
        var existing = window.onerror;
        var newHandler = function(message, url, line, col, err) {
            if ($A.initialized) {
                $A.logger.reportError(err);
            }

            handleError(message, err);
            return true;
        };

        return function() {
            if (existing) {
                existing.apply(this, arguments);
            }

            return newHandler.apply(this, arguments);
        };
    })();
})();
