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
    getEventSourceComponent: function(component, event) {
        var element = event.target || event.srcElement;
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        return htmlCmp.getAttributes().getComponentValueProvider().getConcreteComponent();
    },
    
    handleEsckeydown: function(component, event) {
    },
    
    handleKeydown: function(component, event) {
        var keyCode = event.keyCode;
        if (event.keyCode === 39 || event.keyCode === 40) {  // right or down arrow key
            event.preventDefault();
            this.setFocusToNextItem(component);
        } else if (event.keyCode === 37 || event.keyCode === 38) {  // left or up arrow key
            event.preventDefault();
            this.setFocusToPreviousItem(component);
        } else if (event.keyCode === 27) {  // Esc key
            event.stopPropagation();
            this.handleEsckeydown(component, event);
        } else if (event.keyCode === 9) {  // tab key: dismiss the list
            this.handleTabkeydown(component, event);
        }
    },
    
    handleTabkeydown: function(component, event) {
    },
    
    matchText: function(component) {
        var keyword = component.get("v.keyword");
        var items = component.get("v.items");
        var regex;
        try {
            regex = new RegExp(keyword, "i");
            for (var j = 0; j < items.length; j++) {
                items[j].keyword = keyword;
                var label = items[j].label;
                var searchResult = regex.exec(label);
                if (searchResult && searchResult[0].length > 0) { // Has a match
                    items[j].visible = true;
                } else {
                    items[j].visible = false;
                }
            }
        } catch (e) { // if keyword is not a legal regular expression, don't show anything
            for (var i = 0; i < items.length; i++) {
                items[i].keyword = keyword;
                items[i].visible = false;
            }
        }
        component.setValue("v.items", items);
        component.setValue("v.visible", true);
    },
    
    setFocusToNextItem: function(component) {
    },
    
    setFocusToPreviousItem: function(component) {
    }
})
