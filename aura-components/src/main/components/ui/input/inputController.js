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
    init : function(cmp) {
        var indicator = cmp.get('v.requiredIndicator');
        if (indicator && indicator.length > 0) {
            var indicatorCmp = indicator[0];
            if (indicatorCmp && indicatorCmp.isValid && indicatorCmp.isValid()) {
                indicatorCmp.autoDestroy(false);
            }
        }
    },

    onDestroy : function (cmp) {
        var indicator = cmp.get('v.requiredIndicator');

        if (indicator && indicator.length > 0) {
            var indicatorCmp = indicator[0];
            if (indicatorCmp && indicatorCmp.isValid()) {
                indicatorCmp.destroy();
            }
        }
    },

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

    handleLabelChange : function (cmp) {
        var labelComponent = cmp.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
        	var isCompound = cmp.get("v.isCompound");
        	var setAttribute = "v.label";
	        //for compound fields we need to set legend and not label
	        if(isCompound){
	        	setAttribute = "v.legend";
	        }
            labelComponent.set(setAttribute, cmp.get("v.label"));
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
    },

    updateRequired : function(cmp) {
        var labelComponent = cmp.find("inputLabel");

        if (labelComponent) {
            var labelDisplay = labelComponent.get("v.labelDisplay");
            var indicator = labelDisplay && cmp.get("v.required") ? cmp.get("v.requiredIndicator") : null;

            labelComponent.set("v.requiredIndicator", indicator);
        }
    }


})// eslint-disable-line semi
