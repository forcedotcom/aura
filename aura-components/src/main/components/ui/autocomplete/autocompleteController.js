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
    doInit: function(component, event, helper) {
        var inputCmp = component.find("input");
        if (inputCmp) {
            inputCmp.addHandler("input", component, "c.handleInputChange"); // Later on we need to make it work on older browsers too.
            inputCmp.addHandler("keydown", component, "c.handleKeyAction");
        }
    },
    
    handleInputChange: function(component, event, helper) {
        var inputCmp = event.getSource();
        var value = inputCmp.getElement().value;
        var inputChangeEvt = component.get("e.inputChange");
        inputChangeEvt.setParams({
            value: value
        });
        inputChangeEvt.fire();
    },
    
    handleKeyAction: function(component, event, helper) {
        helper.handleKeyAction(component, event);
    },
    
    handleSelectOption: function(component, event, helper) {
        var optionSelectEvt = component.get("e.selectListOption");
        optionSelectEvt.setParams({
            option: event.getParam("option")
        });
        optionSelectEvt.fire();
    },
    
    matchText: function(component, event, helper) {
        var listCmp = component.find("list");
        listCmp.setValue("v.keyword", event.getParam("keyword"));
        listCmp.setValue("v.visible", true);
    }
})
