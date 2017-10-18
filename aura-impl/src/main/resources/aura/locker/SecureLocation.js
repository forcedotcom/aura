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

function SecureLocation(loc, key) {
    "use strict";

    var o = ls_getFromCache(loc, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return loc.href;
            }
        }
    });

    [ "href", "protocol", "host", "hostname", "port", "pathname", "search", "hash", "username", "password", "origin" ].forEach(function(property) {
        SecureObject.addPropertyIfSupported(o, loc, property);
    });

    [ "assign", "reload", "replace" ].forEach(function(method) {
        SecureObject.addMethodIfSupported(o, loc, method);
    });

    ls_setRef(o, loc, key);
    ls_addToCache(loc, o, key);
    ls_registerProxy(o);

    return o;
}
