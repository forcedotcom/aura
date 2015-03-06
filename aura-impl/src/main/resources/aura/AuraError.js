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
        var getStack = function(error) {
            var map = {};
            var stack = [ String.Format("{0}: {1}",error.name,error.message) ];
            var caller = getStack.caller && getStack.caller.caller;
            while (caller) {
                if (map[caller]) {
                    stack.push(String.Format("{0} (Recursion Entry Point)",Function.GetName(caller)));
                    break;
                }
                if (caller.caller == System.Script.Attributes.DecoratedFunction) {
                    stack.push(Function.GetName(caller.arguments[0]));
                } else {
                    stack.push(Function.GetName(caller));
                }
                map[caller] = true;
                caller = caller.caller;
            }
            return stack.join('\n\tat ');
        };

        if (message == null) {
            message = '';
        }
        var error = new Error(message);
        error.name = this.name;
        this.lineNumber = error.lineNumber;
        this.number = error.number;
        this.message = message;
        this.stackTrace = error.stack || (error.getStack && error.getStack()) || getStack(this);
    }

    AuraError.apply(this,arguments);

    this["name"] = this.name;
    this["message"] = this.message;
    this["stackTrace"] = this.stackTrace;
    this["errorCode"] = this.errorCode;
    this["handled"] = false;
    this["data"] = null;
};

$A.ns.AuraError.prototype = new Error();
$A.ns.AuraError.prototype.constructor = $A.ns.AuraError;