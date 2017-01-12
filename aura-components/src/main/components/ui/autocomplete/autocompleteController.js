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

        var listCmp = helper.getListComponent(component);
        if (listCmp && !listCmp.isInstanceOf("ui:autocompleteListInterface")) {
            throw new Error("The autocomplete list must implement ui:autocompleteListInterface: " + listCmp);
        }

        if (listCmp && listCmp.isInstanceOf("ui:autocompleteList")) {
            helper.initPanelPositionHandlers(component);

            // check for required fields if we're not using a custom autocomplete list
            ["dataProvider", "optionVar", "listOption"].forEach(function(attribute) {
                if (!component.get("v." + attribute)) {
                    throw new Error("Missing required attribute '" + attribute + "'");
                }
            });
        }

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

    abortFetchData: function(component, event, helper) {
        helper.abortFetchData(component, event);
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
    
    handleKeyAction: function(component, event) {
        var concrete = component.getConcreteComponent();
        var concreteHelper = concrete.getDef().getHelper();
        concreteHelper.handleKeyAction(component, event);
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
    
    matchText: function(component, event, helper) {
        var listCmp = helper.getListComponent(component);
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
            var listReferenceComponent = component.get("v.listReferenceComponent");
            if (!$A.util.isEmpty(listReferenceComponent) && !$A.util.isUndefinedOrNull(listReferenceComponent[0])) {
                panel.set('v.referenceElement', listReferenceComponent[0].getElement());
            } else {
                panel.set('v.referenceElement', component.find('input').getElement());
            }
            $A.getEvt("markup://ui:stackPanel").setParams({
                callback: function(zIndex) {
                    panel.set('v.zIndex', zIndex);
                }
            }).fire();
        }
        var concrete = component.getConcreteComponent();
        var concreteHelper = concrete.getDef().getHelper();
        concreteHelper.handleListExpand(component, event);
    },

    referenceElementChange: function(component, event, helper) {
        // this is only supported if autocomplete is used with the default list, or if the custom list defines "listReferenceComponent"
        if (!helper.isDefaultList(component)) {
            throw new Error("ui:autocomplete: function 'referenceElementChange' is not supported with a custom list.");
        }
        var usePanel = component.get('v.usePanel');
        if (!usePanel) {
            var list = helper.getListComponent(component);
            var referenceComponent = component.get("v.listReferenceComponent");
            list.set("v.listReferenceComponent", referenceComponent);
        }
    },

    repositionPanel: function (component) {
        if (!component.get('v.usePanel')) {
            return;
        }

        component.find("panel").repositionPanel();
    }
})// eslint-disable-line semi
