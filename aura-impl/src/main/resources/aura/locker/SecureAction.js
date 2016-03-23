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

    var o = Object.create(null, {
        "toString": {
            value: function() {
                return "SecureAction: " + action + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        "setCallback": SecureThing.createFilteredMethod(action, "setCallback"),
        "setParams": SecureThing.createFilteredMethod(action, "addHandler"),
        "setParam": SecureThing.createFilteredMethod(action, "addHandler"),
        "getParams": SecureThing.createFilteredMethod(action, "getParams"),
        "getParam": SecureThing.createFilteredMethod(action, "getParam"),
        "getCallback": SecureThing.createFilteredMethod(action, "getCallback"),
        "getState": SecureThing.createFilteredMethod(action, "getState"),
        "getReturnValue": SecureThing.createFilteredMethod(action, "getReturnValue"),
        "getError": SecureThing.createFilteredMethod(action, "getError"),
        "isBackground": SecureThing.createFilteredMethod(action, "isBackground"),
        "setBackground": SecureThing.createFilteredMethod(action, "setBackground"),
        "setAbortable": SecureThing.createFilteredMethod(action, "setAbortable"),
        "setStorable": SecureThing.createFilteredMethod(action, "setStorable")
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", action);
    return Object.seal(o);
}
