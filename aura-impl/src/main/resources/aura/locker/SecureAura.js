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

    // SecureUtil: creating a proxy for $A.util
    var su = Object.create(null);
    var o = Object.create(null, {
        "util": {
            enumerable: true,
            value: su
        },
        toString: {
            value: function() {
                return "SecureAura: " + AuraInstance + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });
    Object.defineProperties(o, {
        "createComponent": SecureObject.createFilteredMethod(o, AuraInstance, "createComponent"),
        "createComponents": SecureObject.createFilteredMethod(o, AuraInstance, "createComponents"),
        "enqueueAction": SecureObject.createFilteredMethod(o, AuraInstance, "enqueueAction"),
        "error": SecureObject.createFilteredMethod(o, AuraInstance, "error"),
        "get": SecureObject.createFilteredMethod(o, AuraInstance, "get"),
        "getCallback": SecureObject.createFilteredMethod(o, AuraInstance, "getCallback"),
        "getComponent": SecureObject.createFilteredMethod(o, AuraInstance, "getComponent"),
        "getRoot": SecureObject.createFilteredMethod(o, AuraInstance, "getRoot"),
        "log": SecureObject.createFilteredMethod(o, AuraInstance, "log"),
        "warning": SecureObject.createFilteredMethod(o, AuraInstance, "warning")
    });
    
    ["isEmpty", "hasClass", "addClass", "removeClass", "toggleClass"].forEach(function(name) {
        Object.defineProperty(su, name, SecureObject.createFilteredMethod(su, AuraInstance["util"], name));
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", AuraInstance);
    setLockerSecret(su, "key", key);
    setLockerSecret(su, "ref", AuraInstance["util"]);
    Object.seal(su);
    return Object.seal(o);
}
