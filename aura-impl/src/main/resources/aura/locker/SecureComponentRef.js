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
        }
    });
    Object.defineProperties(o, {
        "isValid": SecureObject.createFilteredMethod(o, component, "isValid"),
        "isInstanceOf": SecureObject.createFilteredMethod(o, component, "isInstanceOf"),
        "isRendered": SecureObject.createFilteredMethod(o, component, "isRendered"),
        "getGlobalId": SecureObject.createFilteredMethod(o, component, "getGlobalId"),
        "getLocalId": SecureObject.createFilteredMethod(o, component, "getLocalId"),
        "addValueProvider": SecureObject.createFilteredMethod(o, component, "addValueProvider"),
        "set": SecureObject.createFilteredMethod(o, component, "set"),
        "get": {
            enumerable: true,
            value: function(name) {
                // protection against anything other then `cmp.get('v.something')`
                if (typeof name !== "string" || name.length < 3 || name.indexOf("v.") !== 0) {
                    throw new SyntaxError('Invalid key '+ name);
                }
                return SecureObject.filterEverything(o, component["get"](name));
            }
        }
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", component);
    return Object.seal(o);
}
