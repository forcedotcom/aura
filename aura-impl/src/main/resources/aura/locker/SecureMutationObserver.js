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


/**
 * Construct a SecureMutationObserver.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            key - the key to apply to the secure mutation observer
 */
function SecureMutationObserver(key) {
    "use strict";

    function filterRecords(st, records) {
        var filtered = [];

        records.forEach(function(record) {
            if (ls_hasAccess(st, record.target)) {
                filtered.push(SecureObject.filterEverything(st, record));
            }
        });

        return filtered;
    }

    // Create a new closure constructor for new XHMLHttpRequest() syntax support that captures the key
    return function(callback) {
        var o = Object.create(null); 

        var observer = new MutationObserver(function(records) {
            var filtered = filterRecords(o, records);
            if (filtered.length > 0) {
                callback(filtered);
            }
        });

        Object.defineProperties(o, {
            toString: {
                value: function() {
                    return "SecureMutationObserver: " + observer + " { key: " + JSON.stringify(key) + " }";
                }
            },

            "observe": SecureObject.createFilteredMethod(o, observer, "observe", { rawArguments: true }),
            "disconnect": SecureObject.createFilteredMethod(o, observer, "disconnect"),

            "takeRecords": {
                writable: true,
                value: function() {
                    return filterRecords(o, observer["takeRecords"]());
                }
            }
        });

        ls_setRef(o, observer, key);

        return Object.freeze(o);
    };
}
