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

function SecureComponentRef(component, key) {
    "use strict";

    var o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureComponentRef: " + component + "{ key: " + JSON.stringify(key) + " }";
            }
        },

        "isValid": SecureThing.createPassThroughMethod(component, "isValid"),
        "isInstanceOf": SecureThing.createPassThroughMethod(component, "isInstanceOf"),
        "isRendered": SecureThing.createPassThroughMethod(component, "isRendered"),
        "getGlobalId": SecureThing.createPassThroughMethod(component, "getGlobalId"),
        "getLocalId": SecureThing.createPassThroughMethod(component, "getLocalId"),
        "addValueProvider": SecureThing.createPassThroughMethod(component, "addValueProvider"),
        "set": SecureThing.createFilteredMethod(component, "set"),
        "get": SecureThing.createFilteredMethod(component, "get")

    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", component);
    return Object.seal(o);
}
