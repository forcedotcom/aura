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

function SecureDOMEvent(event, key) {
    "use strict";

    var o = ls_getFromCache(event, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureDOMEvent: " + event + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    var DOMEventSecureDescriptors = {
        // Events properties that are DOM Elements were compiled from
        // https://developer.mozilla.org/en-US/docs/Web/Events
        target: SecureObject.createFilteredProperty(o, event, "target"),
        currentTarget: SecureObject.createFilteredProperty(o, event, "currentTarget"),

        initEvent: SecureObject.createFilteredMethod(o, event, "initEvent"),

        // Touch Events are special on their own:
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch
        touches: SecureDOMEvent.filterTouchesDescriptor(o, event, "touches"),
        targetTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, "targetTouches"),
        changedTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, "changedTouches"),

        view: {
            get: function() {
            	var swin = $A.lockerService.getEnvForSecureObject(o);
            	var win = ls_getRef(swin, key);
                return win === event.view ? swin : undefined;
            }
        }
    };

    // non-standard properties and aliases
    ["relatedTarget", "srcElement", "explicitOriginalTarget", "originalTarget"].forEach(function(property) {
    	SecureObject.addPropertyIfSupported(o, event, property);
    });

    // re-exposing externals
    // TODO: we might need to include non-enumerables
    for (var name in event) {
        if (!(name in o)) {
            // every DOM event has a different shape, we apply filters when possible,
            // and bypass when no secure filter is found.
            Object.defineProperty(o, name, DOMEventSecureDescriptors[name] || SecureObject.createFilteredProperty(o, event, name));
        }
    }

    ls_setRef(o, event, key);
    ls_addToCache(event, o, key);

    return o;
}

SecureDOMEvent.filterTouchesDescriptor = function (se, event, propName) {
    "use strict";

    // descriptor to produce a new collection of touches where the target of each
    // touch is a secure element
    return {
        get: function() {
            // perf hard-wired in case there is not a touches to wrap
            var touches = event[propName];
            if (!touches) {
                return touches;
            }
            // touches, of type ToucheList does not implement "map"
            return Array.prototype.map.call(touches, function(touch) {
                // touches is normally a big big collection of touch objects,
                // we do not want to pre-process them all, just create the getters
                // and process the accessor on the spot. e.g.:
                // https://developer.mozilla.org/en-US/docs/Web/Events/touchstart
                var keys = [];
                var touchShape = touch;
                // Walk up the prototype chain and gather all properties
                do {
                    keys = keys.concat(Object.keys(touchShape));
                }while((touchShape = Object.getPrototypeOf(touchShape)) && touchShape !== Object.prototype)
                // Create a stub object with all the properties
                return keys.reduce(function(o, p) {
                    return Object.defineProperty(o, p, {
                        // all props in a touch object are readonly by spec:
                        // https://developer.mozilla.org/en-US/docs/Web/API/Touch
                        get: function() {
                            return SecureObject.filterEverything(se, touch[p]);
                        }
                    });
                }, {});
            });
        }
    };
};
