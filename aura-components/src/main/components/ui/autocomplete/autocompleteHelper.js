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
        component._delay(function() { }, 0);
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
        if (list.get("v.visible") === true) {
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
        var inputCmp = component.find("input");
        var listCmp = this.getListComponent(component);
        if (inputCmp && listCmp) {
            var elems = inputCmp.getElements();
            listCmp.set("v.ignoredElements", elems);
        }
    },

    addIgnoredElement: function(component, element) {
        var listCmp = this.getListComponent(component);
        if (listCmp) {
            var ignoreElements = listCmp.get("v.ignoredElements");
            ignoreElements.push(element);
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