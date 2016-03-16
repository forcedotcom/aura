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
        "setCallback": {
            enumerable: true,
            value: function (scope, callback, name) {
                // setCallback is special because we need to guarantee that even though the callback function
                // is set in user-mode, when that callback gets called in system-mode, all the arguments and
                // the scope gets restored before calling into the provided callback.
                action.setCallback(scope, function (ignoredAction, cmp) {
                    $A.assert(o === ignoredAction,
                              "actions should be sandboxed.");
                    var sc = $A.lockerService.util.hasAccess(o, cmp) ? SecureComponent(cmp, key) : SecureComponentRef(cmp, key);
                    callback.call(scope, o, sc);
                }, name);
            }
        },
        "toString": {
            value: function() {
                return "SecureAction: " + action + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        "setParams": SecureThing.createPassThroughMethod(action, "addHandler"),
        "setParam": SecureThing.createPassThroughMethod(action, "addHandler"),
        "getParams": SecureThing.createFilteredMethod(action, "getParams"),
        "getParam": SecureThing.createFilteredMethod(action, "getParam"),
        "getCallback": SecureThing.createFilteredMethod(action, "getCallback"),
        "getState": SecureThing.createFilteredMethod(action, "getState"),
        "getReturnValue": SecureThing.createFilteredMethod(action, "getReturnValue"),
        "getError": SecureThing.createFilteredMethod(action, "getError"),
        "isBackground": SecureThing.createPassThroughMethod(action, "isBackground"),
        "setBackground": SecureThing.createPassThroughMethod(action, "setBackground"),
        "setAbortable": SecureThing.createPassThroughMethod(action, "setAbortable"),
        "setStorable": SecureThing.createPassThroughMethod(action, "setStorable")
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", action);
    return Object.seal(o);
}
