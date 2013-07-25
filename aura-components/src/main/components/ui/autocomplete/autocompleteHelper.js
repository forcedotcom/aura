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
    fetchData: function(component, event) {
        // Show loading indicator
        var listCmp = component.find("list");
        if (listCmp) {
            var listHelper = listCmp.getDef().getHelper();
            listHelper.showLoading(listCmp.getSuper(), true);
        }
        // set keyword to list component
        var options = event.getParam("parameters");
        var listCmp = component.find("list");
        if (listCmp) {
            listCmp.setValue("v.keyword", options.keyword);
        }
        
        // fire dataProvide event
        var dataProviders = component.getValue("v.dataProvider");
        var index = event.getParam("index");
        if (!index) {
            index = 0;
        }
        var provideEvent = dataProviders.get(index).get("e.provide");
        provideEvent.setParams({
            parameters: options
        });
        provideEvent.fire();
    },
    
    fireInputChangeEvent: function(component, event) {
        // Hide the list if it is already visible
        this.hideList(component);
             
        // Fire input change event    
        var inputCmp = event.getSource();
        var value = inputCmp.getElement().value;
        var inputChangeEvt = component.get("e.inputChange");
        if (inputChangeEvt) {
            inputChangeEvt.setParams({
                value: value
            });
            inputChangeEvt.fire();
        }
    },
    
    hideList: function(component) {
        var list = component.find("list");
        if (list && list.get("v.visible") === true) {
            list.setValue("v.visible", false);
        }
    },
    
    handleEnterkey: function(component, event) {
        var list = component.find("list");
        if (list.get("v.visible") === true) {
            var pEvent = list.get("e.pressOnHighlighted");
            pEvent.fire();
        }
    },
    
    handleEsckey: function(component, event) {
        this.hideList(component);
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
            domEvent.stopPropagation();
            this.handleEsckey(component, event);
        } else if (keyCode === 9) {  // tab key: dismiss the list
            this.handleTabkey(component, event);
        } else if (keyCode === 13) {  // enter key: select the highlighted list option
            this.handleEnterkey(component, event);
        }
    },
    
    handleTabkey: function(component, event) {
        this.hideList(component);
    },
    
    highlightNextItem: function(component, event) {
        var list = component.find("list");
        if (list.get("v.visible") === true) {
            var highlightEvent = list.get("e.listHighlight");
            highlightEvent.setParams({
                activeIndex: 0
            });
            highlightEvent.fire();
        }
    },
    
    highlightPrevItem: function(component) {
        var list = component.find("list");
        if (list.get("v.visible") === true) {
            var highlightEvent = list.get("e.listHighlight");
            highlightEvent.setParams({
                activeIndex: -1
            });
            highlightEvent.fire();
        }
    },
    
    /**
     * Tell list component which elements it should ignore to handle collapse.
     *
     */
    setInputElements: function(component) {
        var inputCmp = component.find("input");
        var listCmp = component.find("list");
        if (inputCmp && listCmp) {
            var elems = inputCmp.getElements();
            listCmp.setValue("v.elementsToIgnoreClicking", elems);
        }
    },
    
    updateAriaAttributes: function(component, event) {
        var inputCmp = component.find("input");
        var elem = inputCmp ? inputCmp.getElement() : null;
        if (elem) {
            var attrs = event.getParam("attrs");
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    elem.setAttribute(key, attrs[key]);
                }
            }
        }
    }
})
