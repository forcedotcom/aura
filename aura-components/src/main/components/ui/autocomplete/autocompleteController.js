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
            inputCmp.addHandler("focus", component, "c.handleFocus");
        }
        // This calls a function (callback) in a delayed manner and it can be cancelled.
        component._delay = (function(){
            var timer = 0;
            return function(callback, ms){
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            };
        })();
    },
    
    fetchData: function(component, event, helper) {
        helper.fetchData(component, event);
    },
    
    handleFocus: function(component, event, helper) {
        var inputCmp = event.getSource();
        var elem = inputCmp ? inputCmp.getElement() : null;
        if (elem) {
            elem.setAttribute("aria-activedescendant", "");
        }
    },
    
    handleInputChange: function(component, event, helper) {
        if (component._delay) {
            component._delay(function() {
                helper.fireInputChangeEvent(component, event);
            }, 300);
        } else {
            helper.fireInputChangeEvent(component, event);
        }
    },
    
    handleKeyAction: function(component, event, helper) {
        helper.handleKeyAction(component, event);
    },
    
    handleMatchDone: function(component, event, helper) {
        var evt = component.get("e.matchDone");
        if (evt) {
            evt.setParams({
                size: event.getParam("size")
            });
            evt.fire();
        }
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
        if (listCmp) {
            listCmp.setValue("v.keyword", event.getParam("keyword"));
            listCmp.get("e.matchText").fire();
        }
    },
    
    updateAriaAttributes: function(component, event, helper) {
        helper.updateAriaAttributes(component, event);
    }
})
