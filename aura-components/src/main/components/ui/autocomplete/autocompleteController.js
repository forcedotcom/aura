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
            inputCmp.addHandler("blur", component, "c.handleBlur");
        }
        helper.relayEvents(component);
        // This calls a function (callback) in a delayed manner and it can be cancelled.
        component._delay = (function(){
            var timer = 0;
            return function(callback, ms){
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();
    },
    
    fetchData: function(component, event, helper) {
        helper.fetchData(component, event);
    },
    
    fireEventsFromInput: function(component, event) {
        var e = component.getEvent(event.getName());
        if (e) {
        	e.setParams(event.getParams());
        	e.fire();
        }
    },

    handleFocus: function(component, event, helper) {
        var inputCmp = event.getSource();
        if (inputCmp) {
            inputCmp.set("v.ariaActiveDescendant", "");
            var domEvent = event.getParam("domEvent");
            helper.fireEvent(component, domEvent, helper);
        }
    },

    handleBlur: function(component, event, helper) {
        var inputCmp = event.getSource();
        if (inputCmp) {
            var domEvent = event.getParam("domEvent");
            helper.fireEvent(component, domEvent, helper);
        }
    },
    
    handleInputChange: function(component, event, helper) {
        // DVAL: HALO: FIXME: This sync should be done by the input itself 
        // before firing the event to anyone else.
        var inputHelper = component.getDef().getHelper();
        var value = inputHelper.getInputElement(component).value;
        inputHelper.doUpdate(component.find('input'), value);

        if (component._delay) {
            component._delay(function() {
            	if (component && component.isValid()) {
                    helper.fireInputChangeEvent(component, event);
            	}
            }, 300);
        } else {
            helper.fireInputChangeEvent(component, event);
        }
    },
    
    handleKeyAction: function(component, event, helper) {

        var concrete = component.getConcreteComponent();
        var concreteHelper = concrete.getDef().getHelper();
        concreteHelper.handleKeyAction(component, event);
        var domEvent = event.getParam("domEvent");
        helper.fireEvent(component, domEvent, helper);
    },
    
    handleMatchDone: function(component, event) {
        var evt = component.get("e.matchDone");
        if (evt) {
            evt.setParams({
                size: event.getParam("size")
            });
            evt.fire();
        }
    },
    
    handleSelectOption: function(component, event) {
        var optionSelectEvt = component.get("e.selectListOption");
        optionSelectEvt.setParams({
            option: event.getParam("option"),
            isHeader: event.getParam("isHeader")===true,
            isFooter: event.getParam("isFooter")===true
        });
        optionSelectEvt.fire();
    },
    
    matchText: function(component, event) {
        var listCmp = component.find("list");
        if (listCmp) {
            listCmp.set("v.keyword", event.getParam("keyword"));
            listCmp.get("e.matchText").fire();
        }
    },
    
    updateAriaAttributes: function(component, event, helper) {
        helper.updateAriaAttributes(component, event);
    },

    handleListExpand: function(component, event) {
        var usePanel = component.get('v.usePanel');
        var panel = component.find('panel');
        
        if(usePanel) {
            panel.set('v.visible', true);
            panel.set('v.referenceElement', component.find('input').getElement().querySelector('input'));
            $A.get('e.ui:stackPanel').setParams({
                callback: function(zIndex) {
                    panel.set('v.zIndex', zIndex);
                }
            }).fire();
        }
        var concrete = component.getConcreteComponent();
        var concreteHelper = concrete.getDef().getHelper();
        concreteHelper.handleListExpand(component, event);
    }
})// eslint-disable-line semi
