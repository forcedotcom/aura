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

/**
 * Factory for SecureAura objects.
 *
 * @param {Object}
 *            AuraInstance - the Aura Instance to be secured
 * @param {Object}
 *            key - the key to apply to the secure aura
 */
function SecureAura(AuraInstance, key) {
    "use strict";

    // creating a proxy for $A.util
    var util = Object.create(null);
    ["isEmpty", "hasClass", "addClass", "removeClass", "toggleClass"].forEach(function(name) {
        Object.defineProperty(util, name, {
            enumerable: true,
            value: AuraInstance["util"][name]
        });
    });
    Object.seal(util);
    var o = Object.create(null, {
        "util": {
            enumerable: true,
            value: util
        },
        "createComponent": {
            enumerable: true,
            value: function(type, attributes, callback) {
                $A.assert(callback && typeof callback === 'function' , 'Callback');
                AuraInstance["createComponent"](type, attributes, function () {
                    callback.apply(undefined, SecureThing.filterEverything(o, SecureThing.ArrayPrototypeSlice.call(arguments)));
                });
            }
        },
        "createComponents": {
            enumerable: true,
            value: function(components, callback) {
                $A.assert(callback && typeof callback === 'function' , 'Callback');
                AuraInstance["createComponents"](components, function () {
                    callback.apply(undefined, SecureThing.filterEverything(o, SecureThing.ArrayPrototypeSlice.call(arguments)));
                });
            }
        },
        toString: {
            value: function() {
                return "SecureAura: " + AuraInstance + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        "enqueueAction": SecureThing.createPassThroughMethod(AuraInstance, "enqueueAction"),
        "errorReport": SecureThing.createPassThroughMethod(AuraInstance, "errorReport"),
        "get": SecureThing.createFilteredMethod(AuraInstance, "get"),
        "getCallback": SecureThing.createFilteredMethod(AuraInstance, "getCallback"),
        "getComponent": SecureThing.createFilteredMethod(AuraInstance, "getComponent"),
        "getRoot": SecureThing.createFilteredMethod(AuraInstance, "getRoot"),
        "log": SecureThing.createPassThroughMethod(AuraInstance, "log"),
        "warning": SecureThing.createPassThroughMethod(AuraInstance, "warning")
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", AuraInstance);
    return Object.seal(o);
}
