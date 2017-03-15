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

function SecureComponent(component, key) {
    "use strict";

    var o = ls_getFromCache(component, key);
    if (o) {
        return o;
    }

    // special methods that require some extra work
    o = Object.create(null, {
        "get": {
            writable: true,
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
                    return SecureObject.filterEverything(o, value);
                }
            }
        },
        "getEvent": {
            writable: true,
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
        }
    });

    Object.defineProperties(o, {
        // these four super* methods are exposed as a temporary solution until we figure how to re-arrange the render flow
        "superRender": SecureObject.createFilteredMethod(o, component, "superRender"),
        "superAfterRender": SecureObject.createFilteredMethod(o, component, "superAfterRender"),
        "superRerender": SecureObject.createFilteredMethod(o, component, "superRerender"),
        "superUnrender": SecureObject.createFilteredMethod(o, component, "superUnrender"),

        // component @platform methods
        "isValid": SecureObject.createFilteredMethod(o, component, "isValid"),
        "isInstanceOf": SecureObject.createFilteredMethod(o, component, "isInstanceOf"),
        "addEventHandler": SecureObject.createFilteredMethod(o, component, "addEventHandler"),
        "addHandler": SecureObject.createFilteredMethod(o, component, "addHandler"),
        "addValueHandler": SecureObject.createFilteredMethod(o, component, "addValueHandler"),
        "addValueProvider": SecureObject.createFilteredMethod(o, component, "addValueProvider"),
        "destroy": SecureObject.createFilteredMethod(o, component, "destroy"),
        "isRendered": SecureObject.createFilteredMethod(o, component, "isRendered"),
        "getGlobalId": SecureObject.createFilteredMethod(o, component, "getGlobalId"),
        "getLocalId": SecureObject.createFilteredMethod(o, component, "getLocalId"),
        "getSuper": SecureObject.createFilteredMethod(o, component, "getSuper"),
        "getReference": SecureObject.createFilteredMethod(o, component, "getReference"),
        "getVersion": SecureObject.createFilteredMethod(o, component, "getVersion"),
        "clearReference": SecureObject.createFilteredMethod(o, component, "clearReference"),
        "autoDestroy": SecureObject.createFilteredMethod(o, component, "autoDestroy"),
        "isConcrete": SecureObject.createFilteredMethod(o, component, "isConcrete"),
        "getConcreteComponent": SecureObject.createFilteredMethod(o, component, "getConcreteComponent"),
        "find": SecureObject.createFilteredMethod(o, component, "find"),
        "set": SecureObject.createFilteredMethod(o, component, "set", { defaultKey: key, rawArguments: true }),
        "getElement": SecureObject.createFilteredMethod(o, component, "getElement"),
        "getElements": SecureObject.createFilteredMethod(o, component, "getElements"),
        "getName": SecureObject.createFilteredMethod(o, component, "getName"),
        "getType": SecureObject.createFilteredMethod(o, component, "getType"),
        "removeEventHandler": SecureObject.createFilteredMethod(o, component, "removeEventHandler")
    });

    // The shape of the component depends on the methods exposed in the definitions:
    var defs = component.getDef().methodDefs;
    if (defs) {
        defs.forEach(function(method) {
            var descriptor = new DefDescriptor(method.name);
            SecureObject.addMethodIfSupported(o, component, descriptor.getName(), { defaultKey: key });
        }, o);
    }

    ls_setRef(o, component, key);
    ls_addToCache(component, o, key); // backpointer
    ls_registerProxy(o);

    return o;
}
