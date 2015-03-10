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
    updateDefaultError : function(component, event, helper){
        helper.setErrorComponent(component);
    },

    init : function(component, event, helper) {
        var positionMap={"top":1,"right":1,"bottom":1,"left":1,"hidden":1};
        if (!positionMap[component.get("v.labelPosition")]) {
            // JBUCH: HALO: TODO: WAITING ON W-1419175
            //once W-1419175 is fixed, then we can set default labelPosition instead of throwing error
            $A.error("labelPosition must be one of the following values: 'top', 'right', 'bottom', 'left', 'hidden'");
            //default labelPosition to 'left'
            //cmp.getDef().getHelper().setAttribute(cmp, {key: 'labelPosition', value: 'left'});
        }
        helper.buildBody(component);
    },

    handleLabelChange : function (component) {
        var labelComponent = component.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
            labelComponent.set("v.label",component.get("v.label"));
        }
    },

    handleLabelPositionChange : function (component) {
        // Currently only handle labelDisplay to avoid rearranging the DOM
        var labelComponent = component.find("inputLabel");
        if (!$A.util.isUndefinedOrNull(labelComponent)) {
            labelComponent.set("v.labelDisplay", component.get("v.labelPosition") != "hidden");
        }
    }
})
