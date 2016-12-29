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

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureAuraEvent: " + event + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

	[ "fire", "getName", "getParam", "getParams", "getPhase", "getSource", "pause", "preventDefault", "resume", "setParam", "setParams", "stopPropagation" ]
	.forEach(function(name) {
		Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, event, name));
	});

    ls_setRef(o, event, key);
    ls_addToCache(event, o, key);

    return Object.seal(o);
}
