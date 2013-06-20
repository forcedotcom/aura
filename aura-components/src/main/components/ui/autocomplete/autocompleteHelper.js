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
    hideList: function(component) {
        var list = component.find("list");
        if (list) {
            list.setValue("v.visible", false);
        }
    },
    
    handleEsckey: function(component, event) {
        this.hideList(component);
    },
    
    handleKeyAction: function(component, event) {
        var keyCode = event.getParam("keyCode");
        var domEvent = event.getParam("domEvent");
        if (keyCode === 39 || keyCode === 40) {  // right or down arrow key
            domEvent.preventDefault();
            this.setFocusToFirstItem(component, event);
        } else if (keyCode === 37 || keyCode === 38) {  // left or up arrow key
            domEvent.preventDefault();
            this.setFocusToLastItem(component, event);
        } else if (keyCode === 27) {  // Esc key
            domEvent.stopPropagation();
            this.handleEsckey(component, event);
        } else if (event.keyCode === 9) {  // tab key: dismiss the list
            this.handleTabkey(component, event);
        }
    },
    
    handleTabkey: function(component, event) {
        this.hideList(component);
    },
    
    setFocusToFirstItem: function(component, event) {
        var list = component.find("list");
        var focusEvent = list.get("e.listHighlight");
        focusEvent.setParams({
            activeIndex: 0
        });
        focusEvent.fire();
    },
    
    setFocusToLastItem: function(component) {
        var list = component.find("list");
        var focusEvent = list.get("e.listHighlight");
        focusEvent.setParams({
            activeIndex: -1
        });
        focusEvent.fire();
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
    
    updateActiveOption: function(component, event) {
        var inputCmp = component.find("input");
        var elem = inputCmp ? inputCmp.getElement() : null;
        if (elem) {
            var id = event.getParam("id");
            elem.setAttribute("aria-activedescendant", id);
        }
    }
})
