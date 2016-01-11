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
/*eslint-disable no-console */

(function(){
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    $A.logger.subscribe("INFO", $A.logger.devDebugConsoleLog);
    $A.logger.subscribe("WARNING", $A.logger.devDebugConsoleLog);
    $A.logger.subscribe("ERROR", $A.logger.devDebugConsoleLog);
    //#end

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

    $A.logger.subscribe("ASSERT", function(level, message) {
        throw new $A.auraError(message);
    });

    $A.logger.subscribe("ERROR", function(level, message, e) {
        $A.handleError(message, e);
    });

    window.onerror = (function() {
        var existing = window.onerror;
        var newHandler = function(message, url, line, col, err) {

            // Firefox private browsing mode throws an uncatchable (except by window.onerror) InvalidStateError when
            // indexedDB.open is called. suppress this type of error. IndexedDBAdapter.js handlers the error. see
            // that file for more details.
            if (message === "InvalidStateError" && navigator.userAgent.indexOf("Firefox") !== -1) {
                return true;
            }

            $A.reportError(message, err);
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
