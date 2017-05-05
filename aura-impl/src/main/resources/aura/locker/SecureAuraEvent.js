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
    function deepUnfilterEventParams(baseObject, members) {
        var value;
        var branchValue;
        for (var property in members) {
            value = members[property];
            if (value !== undefined && value !== null && (Array.isArray(value) || $A.util.isPlainObject(value))) {
                branchValue = baseObject[property];
                baseObject[property] = deepUnfilterEventParams(branchValue, value);
                continue;
            }
            if (typeof value !== "function") {
                value = $A.lockerService.getRaw(value);
                // If value was just a proxy around a plain object,there could still be secure objects inside it, spider through it and unfilter everything inside it
                if ($A.util.isPlainObject(value)) {
                    branchValue = baseObject[property];
                    value = deepUnfilterEventParams(branchValue, value);
                }
            } else {
                value = SecureObject.filterEverything(o, value, { defaultKey: key });
            }
            baseObject[property] = value;
        }
        return baseObject;
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
                var paramsCopy = $A.util.apply({}, config, true, true);
                var unfiltered = deepUnfilterEventParams(paramsCopy, config);
                var fnReturnedValue = event["setParams"](unfiltered);
                return SecureObject.filterEverything(o, fnReturnedValue, { defaultKey: key });
            }
        },
        "setParam": {
            writable: true,
            enumerable: true,
            value: function(config) {
                var paramCopy = $A.util.apply({}, config, true, true);
                var unfiltered = deepUnfilterEventParams(paramCopy, config);
                var fnReturnedValue = event["setParam"](unfiltered);
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
