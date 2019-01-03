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
    /**
     * Map from the element aria attributes to the component attribute names
     * since attributes with hyphens currently don't work inside expressions.
     *
     * TODO: This needs to live somewhere more accessible to most components
     * that deal with aria attributes.
     */
     
     initAutocompleteList: function(component, helper) {
        if(!component._initialized) {
            component._initialized = true;
            
            // Dynamically create autocompleteList
            helper.lazyLoadAutocompleteList(component);
            
            var listCmp = helper.getListComponent(component);
            if (listCmp && !listCmp.isInstanceOf("ui:autocompleteListInterface")) {
                throw new Error("The autocomplete list must implement ui:autocompleteListInterface: " + listCmp);
            }
    
            if (listCmp && listCmp.isInstanceOf("ui:autocompleteList")) {
                helper.initPanelPositionHandlers(component);
    
                // check for required fields if we're not using a custom autocomplete list
                ["dataProvider", "optionVar", "listOption"].forEach(function checkRequiredAttribute(attribute) {
                    if (!component.get("v." + attribute)) {
                        throw new Error("Missing required attribute '" + attribute + "'");
                    }
                });
            }
            
            if(component._deferReferenceElementChange) {
                helper.referenceElementChange(component, component._deferReferenceElementChange, helper);
            }
            
            if(component._deferSetIgnoredElements) {
                helper.setIgnoredElements(component);
            }
            
            if(component._deferAddIgnoredElement) {
                helper.addIgnoredElement(component, component._deferAddIgnoredElement);
            }
        }
    },
     
     lazyLoadAutocompleteList: function(component) {
        var useDefaultList = $A.util.isEmpty(component.get("v.autocompleteList"));
        var usePanel = component.get("v.usePanel");
        var body = component.get('v.body');
        
        if (useDefaultList) {
            var autocompleteListCmp;
            var autocompletePanelCmp;
            var returnCmp;
            
            // Dynamically create autocompleteList
            autocompleteListCmp = $A.createComponentFromConfig({
                descriptor: "markup://ui:autocompleteList",
                localId: "list",
                valueProvider: component,
                skipCreationPath: true,
                attributes: {
                    'class' : component.getReference("v.autocompleteListClass"),
                    'dataProvider' : component.getReference("v.dataProvider"),
                    'itemVar' : component.getReference("v.optionVar"),
                    'itemTemplate' : component.getReference("v.listOption"),
                    'emptyListContent' : component.getReference("v.emptyListContent"),
                    'loadingIndicator' : component.getReference("v.loadingIndicator"),
                    'listHeader' : component.getReference("v.listHeader"),
                    'listFooter' : component.getReference("v.listFooter"),
                    'showListHeader' : component.getReference("v.showListHeader"),
                    'showListFooter' : component.getReference("v.showListFooter"),
                    'theme' : component.getReference("v.theme"),
                    'visible' : false,
                    'role' : "listbox",
                    'propertyToMatch' : component.getReference("v.propertyToMatch"),
                    'matchDone' : component.getReference("c.handleMatchDone"),
                    'selectListOption' : component.getReference("c.handleSelectOption"),
                    'updateAriaAttributes' : component.getReference("c.updateAriaAttributes"),
                    'matchFunc' : component.getReference("v.matchFunc"),
                    'disableMatch' : component.getReference("v.disableMatch"),
                    'setDefaultHighlight' : component.getReference("v.setDefaultHighlight"),
                    'showEmptyList' : component.getReference("v.showEmptyList")
                }
            });
            
            if (usePanel) {
                // Dynamically create autocompletePanel
                autocompletePanelCmp = $A.createComponentFromConfig({
                    descriptor: "markup://ui:autocompletePanel",
                    localId: "panel",
                    valueProvider: component
                });
                
                // insert autocompletePanel into returnCmp
                var autocompletePanelBody = autocompletePanelCmp.get("v.body");
                autocompletePanelBody.push(autocompleteListCmp);
                autocompletePanelCmp.set("v.body", autocompletePanelBody);
                
                // set returnCmp to autocompletePanelCmp
                returnCmp = autocompletePanelCmp;
            } else {
                // set returnCmp to autocompleteListCmp
                returnCmp = autocompleteListCmp;
            }
            
            // Append returnCmp into autocomplete's body
            body.push(returnCmp);
            component.set("v.body", body);
        }
    },
    
    setAutocompleteClass: function(component) {
        component.set("v.autocompleteListClass", component.get("v.class") + " lookup__menu");
    },
    
    referenceElementChange: function(component, event, helper) {
        // this is only supported if autocomplete is used with the default list, or if the custom list defines "listReferenceComponent"
        if (!helper.isDefaultList(component)) {
            throw new Error("ui:autocomplete: function 'referenceElementChange' is not supported with a custom list.");
        }
        var usePanel = component.get("v.usePanel");
        if (!usePanel) {
            var list = helper.getListComponent(component);
            var referenceComponent = component.get("v.listReferenceComponent");
            list.set("v.listReferenceComponent", referenceComponent);
        }
    },
    
    ariaAttributeMap: {
        "aria-expanded": "ariaExpanded",
        "aria-activedescendant": "ariaActiveDescendant"
    },

    fetchData: function(component, event) {
        var listCmp = this.getListComponent(component);
        if (listCmp) {
            var options = event.getParam("parameters");
            var index = event.getParam("index");
            if (!index) {
                index = 0;
            }
            listCmp.fetchData(options, index);
        }
    },

    abortFetchData: function(component, event) {
        // Abort any pending input events if a data request is being canceled
        component._delay(function noop() { }, 0);
        var listCmp = this.getListComponent(component);
        if (listCmp) {
            var options = event.getParam("parameters");
            var index = event.getParam("index");
            if (!index) {
                index = 0;
            }
            listCmp.abortFetchData(options, index);
        }
    },

    fireInputChangeEvent: function(component) {
        //handling case when there is another element like label in the markup
        var value = component.getDef().getHelper().getInputElement(component).value;
        var inputChangeEvt = component.get("e.inputChange");
        var el = component.getDef().getHelper().getInputElement(component);

        // IE 11 fires the input event when we tab off, 
        // causing it to reopen. 
        // 
        // if this event is fired and the element is not focused, ignore
        if (inputChangeEvt && (el === document.activeElement)) {
            inputChangeEvt.setParams({
                value: value
            });
            inputChangeEvt.fire();
        }
    },

    hideList: function(component) {
        var list = this.getListComponent(component);
        if (list && list.get("v.visible") === true) {
            list.set("v.visible", false);
            return true;
        }
        return false;
    },

    handleEnterKey: function(component) {
        var list = this.getListComponent(component);
        if (list.get("v.visible") === true && !$A.util.isEmpty(list.get("v.items"))) {
            this.handleEnterkeyOnList(component, list);
        } else {
            this.handleEnterKeyOnInput(component, component.find("input"));
        }
    },

    handleEnterkeyOnList: function(component, list) {
        var pEvent = list.get("e.pressOnHighlighted");
        pEvent.fire();
    },

    handleEnterKeyOnInput: function() {
    },

    handleEsckey: function(component) {
        return this.hideList(component);
    },

    handleKeyAction: function(component, event) {
        var keyCode = event.getParam("keyCode");
        var domEvent = event.getParam("domEvent");
        if (keyCode === 40) {  // down arrow key
            domEvent.preventDefault();
            this.highlightNextItem(component, event);
        } else if (keyCode === 38) {  // up arrow key
            domEvent.preventDefault();
            this.highlightPrevItem(component, event);
        } else if (keyCode === 27) {  // Esc key
            if (this.handleEsckey(component, event)) {
                domEvent.stopPropagation();
            }
        } else if (keyCode === 9) { // tab key
            this.handleTabKey(component, event);
        } else if (keyCode === 13) {  // enter key: select the highlighted list option
            this.handleEnterKey(component, event);
        } else {
            this.handleOtherKeyAction(component, component.find("input"), event);
        }
    },

    handleOtherKeyAction: function() {
    },

    handleTabKey: function(component, event) {
        if (component.get("v.selectOnTab")) {
            // Select the highlighted list option
            this.handleEnterKey(component, event);
        } else {
            this.hideList(component);
        }
    },

    highlightNextItem: function(component) {
        var list = this.getListComponent(component);
        if (list.get("v.visible") === true) {
            var highlightEvent = list.get("e.listHighlight");
            highlightEvent.setParams({
                activeIndex: 0
            });
            highlightEvent.fire();
        }
    },

    highlightPrevItem: function(component) {
        var list = this.getListComponent(component);
        if (list.get("v.visible") === true) {
            var highlightEvent = list.get("e.listHighlight");
            highlightEvent.setParams({
                activeIndex: -1
            });
            highlightEvent.fire();
        }
    },

    /**
     * Any event fired on input field, we need fire a same one on autocomplete.
     */
    relayEvents: function(component) {
        var inputCmp = component.find("input");
        if (inputCmp) {
            var handledEvents = component.getHandledEvents();
            for ( var name in handledEvents) {
                var eventDef = inputCmp.getDef().getEventDef(name);
                if (eventDef && handledEvents.hasOwnProperty(name) && handledEvents[name] === true) {
                    inputCmp.addHandler(name, component, "c.fireEventsFromInput");
                }
            }
        }
    },

    /**
     * Tell list component which elements it should ignore to handle collapse.
     *
     */
    setIgnoredElements: function(component) {
        if(component._initialized) {
            var inputCmp = component.find("input");
            var listCmp = this.getListComponent(component);
            if (inputCmp && listCmp) {
                var elems = inputCmp.getElements();
                listCmp.set("v.ignoredElements", elems);
            }
        } else {
            component._deferSetIgnoredElements = true;
        }
    },

    addIgnoredElement: function(component, element) {
        if(component._initialized) {
            var listCmp = this.getListComponent(component);
            if (listCmp) {
                var ignoreElements = listCmp.get("v.ignoredElements");
                ignoreElements.push(element);
            }
        } else {
            component._deferAddIgnoredElement = element;
        }
    },

    updateAriaAttributes: function(component, event) {
        var inputCmp = component.find("input");
        if (inputCmp) {
            var attrs = event.getParam("attrs");
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key) && this.ariaAttributeMap[key]) {
                    inputCmp.set("v." + this.ariaAttributeMap[key], attrs[key]);
                }
            }
        }
    },

    handleListExpand: function() {
    },

    getListComponent: function(component) {
        this.initAutocompleteList(component, this);
        var listCmp = component.find("list");
        if (!listCmp) {
            listCmp = component.get("v.autocompleteList")[0];
        }
        return listCmp;
    },

    isDefaultList: function(component) {
        var listCmp = this.getListComponent(component);
        return (listCmp && listCmp.isInstanceOf("ui:autocompleteList"));
    },

    initPanelPositionHandlers: function(component) {
        var dataProviders = component.get("v.dataProvider");
        if (!component.get("v.usePanel") || $A.util.isEmpty(dataProviders)) {
            return;
        }

        dataProviders.forEach(function (dataProvider) {
            dataProvider.addHandler("onchange", component, "c.repositionPanel");
        });
    }

})// eslint-disable-line semi