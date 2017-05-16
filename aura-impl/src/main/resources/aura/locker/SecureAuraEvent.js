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

function SecureAuraEvent(event, key) {
    "use strict";

    var o = ls_getFromCache(event, key);
    if (o) {
        return o;
    }

    /**
     * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
     * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
     * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
     */
    function deepUnfilterEventParams(value) {
        if (Array.isArray(value)) {
            var len = value.length;
            while (len--) {
                value[len] = deepUnfilterEventParams(value[len]);
            }
        } else if ($A.util.isPlainObject(value)) {
            for (var property in value) {
                if (value.hasOwnProperty(property)) {
                    value[property] = deepUnfilterEventParams(value[property]);
                }
            }
        } else if (typeof value !== "function") {
            value = $A.lockerService.getRaw(value);
            // If value was just a proxy around a plain object,there could still be secure objects inside it, spider through it and unfilter everything inside it
            if ($A.util.isPlainObject(value)) {
                value = deepUnfilterEventParams(value);
            }
        } else {
            value = SecureObject.filterEverything(o, value, { defaultKey: key });
        }
        return value;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureAuraEvent: " + event + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        "setParams": {
            writable: true,
            enumerable: true,
            value: function(config) {
                var configCopy = $A.util.apply({}, config, true, true);
                configCopy = deepUnfilterEventParams(configCopy);
                var fnReturnedValue = event["setParams"](configCopy);
                return SecureObject.filterEverything(o, fnReturnedValue, { defaultKey: key });
            }
        },
        "setParam": {
            writable: true,
            enumerable: true,
            value: function(property, value) {
                var valueCopy = $A.util.apply({}, {value: value}, true, true).value;
                valueCopy = deepUnfilterEventParams(valueCopy);
                var fnReturnedValue = event["setParam"](property, valueCopy);
                return SecureObject.filterEverything(o, fnReturnedValue, { defaultKey: key });
            }
        }
    });

	[ "fire", "getName", "getParam", "getParams", "getPhase", "getSource", "pause", "preventDefault", "resume", "stopPropagation", "getType", "getEventType" ]
	.forEach(function(name) {
		Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, event, name));
	});

    ls_setRef(o, event, key);
    ls_addToCache(event, o, key);
    ls_registerProxy(o);

    return Object.seal(o);
}
