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

var SecureAction = (function() {
    "use strict";

    function SecureAction(action, key) {
        setLockerSecret(this, "key", key);
        setLockerSecret(this, "ref", action);
        Object.defineProperty(this, 'setCallback', {
            enumerable: true,
            value: function (scope, callback, name) {
                // setCallback is special because we need to guarantee that even though the callback function
                // is set in user-mode, when that callback gets called in system-mode, all the arguments and
                // the scope gets restored before calling into the provided callback.
                action.setCallback(scope, function (ignoredAction, cmp) {
                    $A.assert(this === ignoredAction,
                              "actions should be sandboxed.");
                    var sc = $A.lockerService.util.hasAccess(this, cmp) ? new SecureComponent(cmp, key) : new SecureComponentRef(cmp, key);
                    callback.call(scope, this, sc);
                }, name);
            }
        });
        Object.preventExtensions(this);
    }

    SecureAction.prototype = Object.create(null, {
        toString: {
            value: function() {
                return "SecureAction: " + getLockerSecret(this, "ref") + "{ key: " + JSON.stringify(getLockerSecret(this, "key")) + " }";
            }
        },
        "setParams": SecureThing.createPassThroughMethod("addHandler"),
        "setParam": SecureThing.createPassThroughMethod("addHandler"),
        "getParams": SecureThing.createFilteredMethod("getParams"),
        "getParam": SecureThing.createFilteredMethod("getParam"),
        "getCallback": SecureThing.createFilteredMethod("getCallback"),
        "getState": SecureThing.createFilteredMethod("getState"),
        "getReturnValue": SecureThing.createFilteredMethod("getReturnValue"),
        "getError": SecureThing.createFilteredMethod("getError"),
        "isBackground": SecureThing.createPassThroughMethod("isBackground"),
        "setBackground": SecureThing.createPassThroughMethod("setBackground"),
        "setAbortable": SecureThing.createPassThroughMethod("setAbortable"),
        "setStorable": SecureThing.createPassThroughMethod("setStorable")
    });

    SecureAction.prototype.constructor = SecureAction;
    Object.preventExtensions(SecureAction.prototype);

    return Object.freeze(SecureAction);
})();
