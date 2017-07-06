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
function LockerService() {
    "use strict";

    // #include aura.locker.InlineSafeEval
    // #include aura.locker.LockerKeyManager
    // #include aura.locker.SecureObject
    // #include aura.locker.SecureDOMEvent
    // #include aura.locker.SecureIFrameElement
    // #include aura.locker.SecureElement
    // #include aura.locker.SecureScriptElement
    // #include aura.locker.SecureDocument
    // #include aura.locker.SecureAura
    // #include aura.locker.SecureStorage
    // #include aura.locker.SecureMutationObserver
    // #include aura.locker.SecureNavigator
    // #include aura.locker.SecureNotification
    // #include aura.locker.SecureXMLHttpRequest
    // #include aura.locker.SecureWindow
    // #include aura.locker.SecureAuraEvent
    // #include aura.locker.SecureAction
    // #include aura.locker.SecureComponent
    // #include aura.locker.SecureComponentRef
    // #include aura.locker.SecureLocation
    // #include aura.locker.SecurePropertyReferenceValue

    var lockers = [];
    var keyToEnvironmentMap = {};
    var lockerShadows;

    var isLockerInitialized;
    var isLockerEnabled = false;

    // This whilelist represents reflective ECMAScript APIs or reflective DOM APIs
    // which, by definition, do not provide authority or access to globals.
    var whitelist = [
                     // Accessible Intrinsics (not reachable by own property name traversal)
                     // -> from ES5
                     "ThrowTypeError",
                     // -> from ES6.
                     "IteratorPrototype", "ArrayIteratorPrototype", "StringIteratorPrototype", "MapIteratorPrototype", "SetIteratorPrototype", "GeneratorFunction", "TypedArray",

                     // Intrinsics
                     // -> from ES5
                     "Function", "WeakMap", "StringMap",
                     // Proxy,
                     "escape", "unescape", "Object", "NaN", "Infinity", "undefined",
                     // eval,
                     "parseInt", "parseFloat", "isNaN", "isFinite", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "Function", "Array", "String", "Boolean", "Number",
                     "Math", "Date", "RegExp", "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError", "JSON",
                     // -> from ES6
                     "ArrayBuffer", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "DataView",
                     "Promise",

                     // Misc
                     "Intl"];

    var nsKeys = {};

    var workerFrame = window.document.getElementById("safeEvalWorkerCustom");
    var safeEvalWindow = workerFrame && workerFrame.contentWindow;
    var typeToOtherRealmType;
    function newMap() {
        if(typeof Map !== "undefined") {
            return new Map();
        } else {
            // Very simple map polyfill
            return function(){
                var polyFillMap = {};
                polyFillMap["get"] = function(key) {
                    return ((key in polyFillMap) ? polyFillMap[key]: undefined);
                };
                polyFillMap["set"] = function(key,value) {
                    polyFillMap[key] = value;
                    return polyFillMap;
                };
                return polyFillMap;
            }();
        }
    }
    // Wire up bidirectional back references from one realm to the other for cross realm instanceof checks
    if (safeEvalWindow) {
        // NOTE: newMap() return a very simple polyfill for Map when browser does not support Map
        typeToOtherRealmType = newMap();
        var types = Object.keys(SecureWindow.metadata["prototypes"]["Window"]).concat([ "Blob", "File", "FormData", "Notification" ]);
        types.forEach(function(name) {
            try{
                var mainInstance = window[name];
                var safeEvalInstance = safeEvalWindow[name];
                if (mainInstance && safeEvalInstance) {
                    typeToOtherRealmType.set(safeEvalInstance, mainInstance);
                    typeToOtherRealmType.set(mainInstance, safeEvalInstance);
                }
            }
            catch(e){
                //continue if we hit exception getting properties
                //e.g window.frameElement throws AccessDenied in Edge/IE)
            }
        });
    }

    // defining LockerService as a service
    var service = {
            initialize: function(context) {
                if (!isLockerInitialized) {
                    isLockerEnabled = (context && !!context["ls"]) && this.containerSupportsRequiredFeatures();
                    isLockerInitialized = true;
                }
            },

            isEnabled : function() {
                return isLockerEnabled;
            },

            containerSupportsRequiredFeatures : function() {
                // Sniff for basic ES5 and strict mode support for Locker
                var isStrictModeAvailable = $A.util.globalEval("(function() { \"use strict\"; return this === undefined; })()");

                var mapIsAvailable = typeof Map !== "undefined" && Map.prototype["keys"] !== undefined && Map.prototype["values"] !== undefined
                && Map.prototype["entries"] !== undefined;

                var proxyIsAvailable = false;
                try {
                    proxyIsAvailable = typeof Proxy !== "undefined" && typeof Node !== "undefined" && (new Proxy({}, {
                            getPrototypeOf: function () {
                                return Node.prototype;
                            }
                        })) instanceof Node;
                } catch (ignored) {
                    // in case Proxy polyfill fails to support
                }

                return isStrictModeAvailable && mapIsAvailable && proxyIsAvailable;
            },

            createForDef : function(code, def) {
                var descriptor = def.getDescriptor();
                var namespace = descriptor.getNamespace();
                var name = descriptor.getName();
                var descriptorDebuggableURL = "components/" + namespace + "/" + name + ".js";
                var key = this.getKeyForNamespace(namespace);

                // Key this def so we can transfer the key to component instances
                ls_setKey(def, key);

                return this.create(code, key, descriptorDebuggableURL);
            },

            getEnv : function(key, /* deprecated*/ doNotCreate) {
                if (!this.isEnabled()) {
                    return undefined;
                }

                var psuedoKeySymbol = JSON.stringify(key);
                var env = keyToEnvironmentMap[psuedoKeySymbol];
                if (!env && !doNotCreate) {
                    env = keyToEnvironmentMap[psuedoKeySymbol] = SecureWindow(window, key, whitelist);
                }

                return env;
            },

            getKeyForNamespace : function(namespace) {
                // Get the locker key for this namespace
                var key = nsKeys[namespace];
                if (!key) {
                    key = nsKeys[namespace] = Object.freeze({
                        "namespace" : namespace
                    });
                }

                return key;
            },

            getEnvForSecureObject : function(st, /* deprecated*/ doNotCreate) {
                if (!this.isEnabled()) {
                    return undefined;
                }

                var key = ls_getKey(st);
                return key ? this.getEnv(key, doNotCreate) : undefined;
            },

            runScript : function(code, namespace) {
                var key = this.getKeyForNamespace(namespace);
                // force Locker because scripts may be run before context is established
                var ret = this.createInternal(code.toString(), key, undefined, undefined, true);
                ret["returnValue"]();
            },

            create : function(code, key, sourceURL, skipPreprocessing) {
                return this.createInternal(code, key, sourceURL, skipPreprocessing);
            },

            createInternal : function(code, key, sourceURL, skipPreprocessing, forceLocker) {
                var envRec;

                if (!lockerShadows) {
                    lazyInitInlinedSafeEvalWorkaround();
                }

                if (forceLocker || this.isEnabled()) {
                    envRec = this.getEnv(key);
                    if (!lockerShadows) {
                        // one time operation to lazily create this giant object with
                        // the value of `undefined` to shadow every global binding in
                        // `window`, except for those with no authority defined in the
                        // `whitelist`. this object will be used as the base lexical
                        // scope when evaluating all non-privilege components.
                        lockerShadows = {};
                        Object.getOwnPropertyNames(window).forEach(function(name) {
                            // apply whitelisting to the lockerShadows
                            // TODO: recursive to cover WindowPrototype properties as well
                            var value = whitelist.indexOf(name) >= 0 ? window[name] : undefined;
                            lockerShadows[name] = value;
                        });
                    }
                } else {
                    // Degrade gracefully back to global window, no shadows, etc
                    envRec = window;

                    if (!lockerShadows) {
                        lockerShadows = {};
                    }
                }

                var returnValue = window['$$safe-eval$$'](code, sourceURL, skipPreprocessing, envRec, lockerShadows);

                var locker = {
                        globals : envRec,
                        returnValue : returnValue
                };

                locker["globals"] = locker.globals;
                locker["returnValue"] = locker.returnValue;

                Object.freeze(locker);
                lockers.push(locker);

                return locker;
            },

            destroy : function(locker) {
                var index = lockers.indexOf(locker);
                if (index >= 0) {
                    lockers.splice(index, 1);
                }
            },

            destroyAll : function() {
                lockers = [];
                keyToEnvironmentMap = [];
            },

            wrapComponent : function(component) {
                if (!this.isEnabled()) {
                    return component;
                }

                var key = ls_getKey(component);
                if (!key) {
                    return component;
                }

                if (typeof component !== "object") {
                    return component;
                }

                var def = component.getDef();
                var ns = def.getDescriptor().getNamespace();
                // return raw component, if either of the following is true:
                // 1. If component belongs to internal namespace and does not extend aura:requireLocker interface
                // 2. If component does not belong to internal namespace and
                //      API Version of component is defined and it is less than 40(Summer '17 release)
                //      (file based components used for testing won't have an API version, so default it to 40 and lockerize)
                if (($A.clientService.isInternalNamespace(ns) && !def.isInstanceOf("aura:requireLocker"))
                    || (!$A.clientService.isInternalNamespace(ns) && parseInt(def.getApiVersion() || 40) < 40)
                ){
                    return component;
                }

                return SecureComponent(component, key);
            },

            wrapComponentEvent : function(component, event) {
                if (!this.isEnabled()) {
                    return event;
                }

                var key = ls_getKey(component);
                if (!key) {
                    return event;
                }

                if (typeof event !== "object" || typeof component !== "object") {
                    return event;
                }

                // if the component is secure, the event have to be secure.
                return event instanceof Aura.Event.Event ? SecureAuraEvent(event, key) : SecureDOMEvent(event, key);
            },

            unwrap : ls_unwrap,

            trust : ls_trust,

            getRaw: function(value) {
                if (value) {
                    var key = ls_getKey(value);
                    if (key) {
                        value = ls_getRef(value, key) || value;
                    }
                }

                return value;
            },

            instanceOf : function(value, type) {
                if (value instanceof type) {
                    return true;
                } else {
                    var otherRealmType = typeToOtherRealmType && typeToOtherRealmType.get(type);
                    return otherRealmType && value instanceof otherRealmType;
                }
            }
    };

    // Exports
    service["initialize"] = service.initialize;
    service["create"] = service.create;
    service["createForDef"] = service.createForDef;
    service["getEnv"] = service.getEnv;
    service["getEnvForSecureObject"] = service.getEnvForSecureObject;
    service["getKeyForNamespace"] = service.getKeyForNamespace;
    service["trust"] = service.trust;
    service["wrapComponent"] = service.wrapComponent;
    service["runScript"] = service.runScript;

    Object.freeze(service);

    return service;
}

Aura.Services.LockerService = LockerService;
