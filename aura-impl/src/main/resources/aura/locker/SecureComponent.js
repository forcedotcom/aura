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

function SecureComponent(component, key) {
    "use strict";

    // Storing a reusable reference to the corresponding secure component into
    // the original component via the locker secret mechanism.
    var sc = getLockerSecret(component, "secure");
    if (sc) {
        return sc;
    }
    // special methods that require some extra work
    var o = Object.create(null, {
        "get": {
            enumerable: true,
            value: function(name) {
                var path = name.split('.');
                // protection against `cmp.get('c')`
                if (typeof path[1] !== "string" || path[1] === "") {
                    throw new SyntaxError('Invalid key '+ name);
                }
                var value = component["get"](name);
                if (!value) {
                  return value;
                }
                if (path[0] === 'c') {
                    return SecureAction(value, key);
                } else {
                    return SecureThing.filterEverything(o, value);
                }
            }
        },
        "getEvent": {
            enumerable: true,
            value: function(name) {
                var event = component["getEvent"](name);
                if (!event) {
                    return event;
                }
                return SecureAuraEvent(event, key);
            }
        },
        toString: {
            value: function() {
                return "SecureComponent: " + component + "{ key: " + JSON.stringify(key) + " }";
            }
        },

        // these four super* methods are exposed as a temporary solution until we figure how to re-arrange the render flow
        "superRender": SecureThing.createFilteredMethod(component, "superRender"),
        "superAfterRender": SecureThing.createPassThroughMethod(component, "superAfterRender"),
        "superRerender": SecureThing.createFilteredMethod(component, "superRerender"),
        "superUnrender": SecureThing.createFilteredMethod(component, "superUnrender"),
        // component @platform methods
        "isValid": SecureThing.createPassThroughMethod(component, "isValid"),
        "isInstanceOf": SecureThing.createPassThroughMethod(component, "isInstanceOf"),
        "addHandler": SecureThing.createPassThroughMethod(component, "addHandler"),
        "destroy": SecureThing.createPassThroughMethod(component, "destroy"),
        "isRendered": SecureThing.createPassThroughMethod(component, "isRendered"),
        "getGlobalId": SecureThing.createPassThroughMethod(component, "getGlobalId"),
        "getLocalId": SecureThing.createPassThroughMethod(component, "getLocalId"),
        "getSuper": SecureThing.createFilteredMethod(component, "getSuper"),
        "getReference": SecureThing.createFilteredMethod(component, "getReference"),
        "clearReference": SecureThing.createPassThroughMethod(component, "clearReference"),
        "autoDestroy": SecureThing.createPassThroughMethod(component, "autoDestroy"),
        "isConcrete": SecureThing.createPassThroughMethod(component, "isConcrete"),
        "addValueProvider": SecureThing.createPassThroughMethod(component, "addValueProvider"),
        "getConcreteComponent": SecureThing.createFilteredMethod(component, "getConcreteComponent"),
        "find": SecureThing.createFilteredMethod(component, "find"),
        "set": SecureThing.createFilteredMethod(component, "set"),
        "getElement": SecureThing.createFilteredMethod(component, "getElement"),
        "getElements": SecureThing.createFilteredMethod(component, "getElements")
    });
    // The shape of the component depends on the methods exposed in the definitions:
    var defs = component.getDef().methodDefs;
    if (defs) {
        defs.forEach(function(method) {
            Object.defineProperty(o, method.name, SecureThing.createFilteredMethod(component, method.name));
        }, o);
    }

    setLockerSecret(component, "secure", o); // backpointer
    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", component);
    return Object.seal(o);
}
