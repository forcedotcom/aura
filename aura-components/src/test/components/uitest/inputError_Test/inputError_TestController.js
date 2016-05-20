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
    doServerError: function(cmp, event, helper) {
        helper.fireServerErrorAction(cmp, function(errors) {
            helper.setErrors(cmp, errors);
            helper.setErrorOutputStatus(cmp);
        });
    },

    doErrorNoEventFire: function(cmp, event, helper) {
        helper.setErrors(cmp, [{message:"Error Happens!"}]);
        helper.setErrorOutputStatus(cmp);
    },

    doErrorNoErrorMsg: function(cmp, event, helper) {
        helper.setErrors(cmp, true);
        helper.setErrorOutputStatus(cmp);
    },

    clearErrors: function(cmp, event, helper) {
        helper.setErrors(cmp, null);
        helper.setClearOutputStatus(cmp);
    },

    doServerErrorFireOnErrorEvent: function(cmp, event, helper) {
        helper.fireServerErrorAction(cmp, function(errors) {
            // triggers handleError
            helper.fireOnErrorEvent(cmp, errors);
        });
    },

    clearErrorFireOnClearErrorsEvent: function(cmp, event, helper) {
        // triggers handleClearError
        helper.fireOnClearErrorsEvent(cmp);
    },

    handleCustomErrors: function(cmp, event, helper){
        var errorMsgObjs = event.getParam("errors");
        if (errorMsgObjs) {
            // setting custom error messages
            for (var i = 0; i < errorMsgObjs.length; i++) {
                errorMsgObjs[i].message = "Custom Error Msg: " + errorMsgObjs[i].message;
            }
            // show the messages
            helper.createCustomErrors(cmp, errorMsgObjs);
            helper.setErrorOutputStatus(cmp);
        }
    },

    handleClearCustomErrors: function(cmp, event, helper) {
        helper.clearCustomErrors(cmp);
        helper.setClearOutputStatus(cmp);
    }
})
