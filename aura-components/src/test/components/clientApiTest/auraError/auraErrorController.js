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
({
    throwError: function(cmp) {
        throw new Error("Controller Error Test");
    },

    failAssert: function(cmp) {
        $A.assert(false, "Controller Assert Test");
    },

    throwFriendlyError: function(cmp) {
        var afe = new $A.auraFriendlyError("Friendly Error Test");
        afe.data = {"friendlyMessage": "Friendly Error Message from data"};
        throw afe;
    },

    handleSystemError: function(cmp, event) {
        if(!cmp.get("v.handleSystemErrorEvent")) {
             return;
        }

        var message = event.getParam("message");
        cmp.set("v.systemErrorHandled", true);
        var afe = event.getParam('auraError');
        if(!afe) {
            return;
        }

        if(cmp.get("v.useFriendlyErrorMessageFromData") && afe.data) {
            message = afe.data["friendlyMessage"];
        }

        if (cmp.get("v.setFriendlyErrorHandled")) {
            afe["handled"] = true;
        }
        $A.message("[Message from customized handler]: " + message);
        event["handled"] = true;
    },

    throwErrorWithCode: function(cmp) {
        var error = new $A.auraFriendlyError("Error With Code Test");
        error["errorCode"] = cmp.get("v.errorCode");
        throw error;
    }
})
