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
 * Construct a SecureNotification.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            key - the key to apply to the secure Notification
 */
function SecureNotification(key) {
    "use strict";

    // Create a new closure constructor for new Notification() syntax support that captures the key
    return function(title, options) {
        var notification = new Notification(title, options);

        var o = Object.create(null, {
            toString: {
                value: function() {
                    return "SecureNotification: " + notification + " { key: " + JSON.stringify(key) + " }";
                }
            }
        });

        // Properties
        ["actions", "badge", "body", "data", "dir", "lang", "tag", "icon", "image", "requireInteraction",
         "silent", "timestamp", "title", "vibrate", "noscreen", "renotify", "sound", "sticky"].forEach(function (name) {
            SecureObject.addPropertyIfSupported(o, notification, name);
        });

        // Event handlers
        ["onclick", "onerror"].forEach(function (name) {
            Object.defineProperty(o, name, {
                set: function(callback) {
                    notification[name] = function(e) {
                        callback.call(o, SecureDOMEvent(e, key));
                    };
                }
            });
        });

        Object.defineProperties(o, {
            close: SecureObject.createFilteredMethod(o, notification, "close")
        });

        ls_setRef(o, notification, key);

        return Object.freeze(o);
    };
}
