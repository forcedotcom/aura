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
 * @description Creates an AuraFriendlyError instance.
 * @constructor
 * @param {Object} def
 * @param {Object} data
 * @param {Component} component
 * @returns {Function}
 * @export
 */
Aura.Errors.AuraFriendlyError = function AuraFriendlyError() {
    Aura.Errors.AuraError.apply(this,arguments);
    this.name = "AuraFriendlyError";
};

Aura.Errors.AuraFriendlyError.prototype = new Aura.Errors.AuraError();
Aura.Errors.AuraFriendlyError.prototype.constructor = Aura.Errors.AuraFriendlyError;
Aura.Errors.AuraFriendlyError.prototype.toString = function() {
    var ret = Error.prototype.toString.apply(this);
    if (this["data"]) {
        ret = ret + "\n\t[custom data: " + JSON.stringify(this["data"]) + ']';
    }

    return ret;
};
