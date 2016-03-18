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

    var DOMEventSecureDescriptors = {
        // Events properties that are DOM Elements were compiled from
        // https://developer.mozilla.org/en-US/docs/Web/Events
        target: SecureThing.createFilteredProperty(event, "target"),
        currentTarget: SecureThing.createFilteredProperty(event, "currentTarget"),
        relatedTarget: SecureThing.createFilteredProperty(event, "relatedTarget"),

        // Touch Events are special on their own:
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch
        touches: SecureDOMEvent.filterTouchesDescriptor(event, "touch"),
        targetTouches: SecureDOMEvent.filterTouchesDescriptor(event, "targetTouches"),
        changedTouches: SecureDOMEvent.filterTouchesDescriptor(event, "changedTouches"),

        // WindowProxy for events like compositionupdate
        // disabling this capability seems to be the right thing to do for now.
        view: {
            get: function() {
                throw Error("Access denied for insecure view");
            }
        },

        // non-standard properties and aliases
        srcElement: SecureThing.createFilteredProperty(event, "srcElement"),
        explicitOriginalTarget: SecureThing.createFilteredProperty(event, "explicitOriginalTarget"),
        originalTarget: SecureThing.createFilteredProperty(event, "originalTarget")
    };

    var o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureDOMEvent: " + event + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    // re-exposing externals
    // TODO: we might need to include non-enumerables
    for (var name in event) {
        if (!(name in o)) {
            // every DOM event has a different shape, we apply filters when possible,
            // and bypass when no secure filter is found.
            Object.defineProperty(o, name, DOMEventSecureDescriptors[name] || SecureThing.createFilteredProperty(event, name));
        }
    }

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", event);
    return Object.seal(o);
}

SecureDOMEvent.filterTouchesDescriptor = function (event, propName) {
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
            var se = this;
            return touches.map(function(touch) {
                // touches is normally a big big collection of touch objects,
                // we do not want to pre-process them all, just create a the getters
                // and process the accessor on the spot. e.g.:
                // https://developer.mozilla.org/en-US/docs/Web/Events/touchstart
                return Object.keys(touch).reduce(function(o, p) {
                    Object.defineProperty(o, p, {
                        // all props in a touch object are readonly by spec:
                        // https://developer.mozilla.org/en-US/docs/Web/API/Touch
                        get: function() {
                            return SecureThing.filterEverything(se, touch[p]);
                        }
                    });
                }, {});
            });
        }
    };
};
