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
/*jslint sub: true, debug: true */

/**
 * @description Creates an AuraError instance.
 * @constructor
 * @param {Object} def
 * @param {Object} data
 * @param {Component} component
 * @returns {Function}
 */
$A.ns.AuraError = function() {
    this.name="AuraError";
    this.message="";
    this.stackTrace="";
    this.errorCode="";

    function AuraError(message) {
        // for IE8
        function getName(method){
            var funcStr=method.toString();
            var name=null;
            var matches = funcStr.match(/\bfunction\s?([^(]*)\(/);
            if (matches && matches.length == 2) {
                name=matches[1];
            }
            return name||"[anonymous]";
        }

        function getStack(error){
            var map = {};
            var stack = [];
            var caller = getStack.caller && getStack.caller.caller;
            while (caller) {
                if (map[caller]) {
                    stack.push(getName(caller) + " (Recursion Entry Point)");
                    break;
                }
                stack.push(getName(caller));
                map[caller]=true;
                caller=caller.caller;
            }
            return stack.join('\n\tat ');
        }

        function getStackTrace(error) {
            var stack;
            if (error.stack) {
                stack = error.stack;
                // Chrome adds the error message to the beginning of the stacktrace. Strip that we only want the the actual stack.
                var chromeStart = error.name + ": " + error.message;
                if (stack && stack.indexOf(chromeStart) === 0) {
                    stack = stack.substring(chromeStart.length + 1);
                }
            } else {
                stack = getStack(this);
            }
            return stack;
        }

        if (message == null) {
            message = '';
        }
        var error = new Error(message);
        error.name = this.name;
        this.lineNumber = error.lineNumber;
        this.number = error.number;
        this.message = message;
        this.stackTrace = getStackTrace(error);
    }

    AuraError.apply(this,arguments);

    this["name"] = this.name;
    this["message"] = this.message;
    this["stackTrace"] = this.stackTrace;
    this["errorCode"] = this.errorCode;
    this["handled"] = false;
    this["reported"] = false;
    this["data"] = null;
};

$A.ns.AuraError.prototype = new Error();
$A.ns.AuraError.prototype.constructor = $A.ns.AuraError;