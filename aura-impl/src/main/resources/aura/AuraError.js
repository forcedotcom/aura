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
 * @export
 */
function AuraError() {
    this.name       = "AuraError";
    this.message    = "";
    this.stackTrace = "";
    this.severity  = "";

    // the component that throws the error
    this.component = "";

    // the action that errors out
    this.action = null;

    // client side error id
    this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var crypto = window.crypto || window.msCrypto;
            var r;
            if (crypto && crypto.getRandomValues) {
                var rands = new Unit8Array(1);//eslint-disable-line no-undef
                crypto.getRandomValues(rands);
                r = rands[0] % 16;
            } else {
                r = Math.random() * 16 | 0;//eslint-disable-line no-bitwise
            }
            var v = c === 'x' ? r : (r & 0x3 | 0x8);//eslint-disable-line no-bitwise
            return v.toString(16);
        });

    function AuraErrorInternal(message, innerError, severity) {
        // for IE8
        function getName(method) {
            var funcStr = method.toString();
            var name = null;
            var matches = funcStr.match(/\bfunction\s?([^(]*)\(/);
            if (matches && matches.length === 2) {
                name = matches[1];
            }
            return name || "[anonymous]";
        }

        function getStack() {
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

        function getStackTrace(err) {
            var stack;
            if (err.stack) {
                stack = err.stack;
                // Chrome adds the error message to the beginning of the stacktrace. Strip that we only want the the actual stack.
                var chromeStart = err.name + ": " + err.message;
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

        var error = innerError || new Error(message);
        error.name = this.name;
        this.lineNumber = error.lineNumber;
        this.number = error.number;
        this.message = error.message || message;
        this.stackTrace = getStackTrace(error);
        this.severity = severity;
    }

    AuraErrorInternal.apply(this,arguments);

    this["name"] = this.name;
    this["message"] = this.message;
    this["stackTrace"] = this.stackTrace;
    this["severity"] = this.severity;
    this["handled"] = false;
    this["reported"] = false;
    this["data"] = null;
    this["id"] = this.id;
}

AuraError.prototype = new Error();
AuraError.prototype.constructor = AuraError;

Aura.Errors.AuraError = AuraError;