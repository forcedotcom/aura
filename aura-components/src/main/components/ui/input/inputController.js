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
    updateError : function(component, event, helper){
        var showErrors = component.get("v.showErrors");
        if (showErrors) {
            helper.updateError(component);
        }
    },

    init : function(component, event, helper) {
        helper.buildBody(component);
    },

    handleLabelChange : function (component) {
        var labelComponent = component.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
            labelComponent.set("v.label",component.get("v.label"));
        }
    },

    handleLabelPositionChange : function (component, evt, helper) {
        // Currently only handle labelDisplay to avoid rearranging the DOM
        var labelComponent = component.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
            labelComponent.set("v.labelDisplay", helper.checkValidPosition(component.get("v.labelPosition")) != "hidden");
        }
    }
})
