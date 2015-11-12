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
    updateError : function(cmp, event, helper){
        var errors = event.getParam("value");

        var showErrors = cmp.get("v.showErrors");
        if (showErrors) {
            helper.updateError(cmp, errors);
        }

        if ($A.util.isEmpty(errors)) {
            var clearEvent = cmp.getEvent("onClearErrors");
            if (clearEvent) {
                clearEvent.fire();
            }
        } else {
            var errorEvent = cmp.getEvent("onError");
            if (errorEvent) {
                errorEvent.fire({errors: errors});
            }
        }
    },

    init : function(cmp, event, helper) {
        helper.buildBody(cmp);
    },

    handleLabelChange : function (cmp) {
        var labelComponent = cmp.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
            labelComponent.set("v.label", cmp.get("v.label"));
        }
    },

    handleLabelPositionChange : function (cmp, evt, helper) {
        // Currently only handle labelDisplay to avoid rearranging the DOM
        var labelComponent = cmp.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
            helper.resetLabelPosition(cmp);
        }
    },

    focus: function(cmp, event, helper) {
        var inputElement = helper.getInputElement(cmp);
        if (inputElement) {
            inputElement.focus();
        }
    }


})// eslint-disable-line semi
