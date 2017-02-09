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

function SecureAction(action, key) {
    "use strict";

    var o = ls_getFromCache(action, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        "toString": {
            value: function() {
                return "SecureAction: " + action + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    Object.defineProperties(o, {
        "setCallback": SecureObject.createFilteredMethod(o, action, "setCallback", { defaultKey: key }),
        "setParams": SecureObject.createFilteredMethod(o, action, "setParams", { defaultKey: key }),
        "setParam": SecureObject.createFilteredMethod(o, action, "setParam", { defaultKey: key }),
        "getParams": SecureObject.createFilteredMethod(o, action, "getParams"),
        "getParam": SecureObject.createFilteredMethod(o, action, "getParam"),
        "getCallback": SecureObject.createFilteredMethod(o, action, "getCallback"),
        "getState": SecureObject.createFilteredMethod(o, action, "getState"),
        "getReturnValue": SecureObject.createFilteredMethod(o, action, "getReturnValue", { defaultKey: key }),
        "getError": SecureObject.createFilteredMethod(o, action, "getError"),
        "isBackground": SecureObject.createFilteredMethod(o, action, "isBackground"),
        "setBackground": SecureObject.createFilteredMethod(o, action, "setBackground"),
        "setAbortable": SecureObject.createFilteredMethod(o, action, "setAbortable"),
        "setStorable": SecureObject.createFilteredMethod(o, action, "setStorable")
    });

    ls_setRef(o, action, key);
    ls_addToCache(action, o, key);
    ls_registerProxy(o);

    return Object.seal(o);
}
