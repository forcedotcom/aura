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

function SecureComponentRef(component, key) {
    "use strict";

    var o = ls_getFromCache(component, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureComponentRef: " + component + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });
    Object.defineProperties(o, {
        "addValueHandler": SecureObject.createFilteredMethod(o, component, "addValueHandler"),
        "addValueProvider": SecureObject.createFilteredMethod(o, component, "addValueProvider"),
        "getGlobalId": SecureObject.createFilteredMethod(o, component, "getGlobalId"),
        "getLocalId": SecureObject.createFilteredMethod(o, component, "getLocalId"),
        "getEvent": SecureObject.createFilteredMethod(o, component, "getEvent"),
        "isInstanceOf": SecureObject.createFilteredMethod(o, component, "isInstanceOf"),
        "isRendered": SecureObject.createFilteredMethod(o, component, "isRendered"),
        "isValid": SecureObject.createFilteredMethod(o, component, "isValid"),
        "set": SecureObject.createFilteredMethod(o, component, "set", { defaultKey: key, rawArguments: true }),
        "get": {
            writable: true,
            enumerable: true,
            value: function(name) {
                // protection against anything other then `cmp.get('v.something')`
                if (typeof name !== "string" || name.length < 3 || (name.indexOf("v.") !== 0 && name.indexOf("e.") !== 0)) {
                    throw new SyntaxError('Invalid key '+ name);
                }

                return SecureObject.filterEverything(o, component["get"](name));
            }
        }
    });

    // The shape of the component depends on the methods exposed in the definitions:
    var defs = component.getDef().methodDefs;
    if (defs) {
        defs.forEach(function(method) {
            var descriptor = new DefDescriptor(method.name);
            SecureObject.addMethodIfSupported(o, component, descriptor.getName(), { defaultKey: key });
        }, o);
    }

    // DCHASMAN TODO Workaround for ui:button redefining addHandler using aura:method!!!
    if (!("addHandler" in o)) {
        SecureObject.addMethodIfSupported(o, component, "addHandler", { rawArguments: true });
    }

    ls_setRef(o, component, key);
    ls_addToCache(component, o, key);
    ls_registerProxy(o);

    return Object.seal(o);
}
