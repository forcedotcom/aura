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
    
    getNextVisibleOption: function(iters, k) {
        var next = -1;
        var start = k >= iters.getLength() -1 ? 0 : k + 1;
        for (var i = start; i < iters.getLength(); i++) {
            var optionCmp = iters.getValue(i);
            if (optionCmp.get("v.visible") === true) {
                next = i;
                break;
            }
        }
        if (next < 0) { // If no visible is found below the current highlighted,  let's start from top.
            for (var j = 0; j < k; j++) {
                var optionCmp = iters.getValue(j);
                if (optionCmp.get("v.visible") === true) {
                    next = j;
                    break;
                }
            }
        }
        return next;
    },
    
    getPrevVisibleOption: function(iters, k) {
        var prev = iters.getLength();
        var start = k <= 0 ? iters.getLength() - 1 : k - 1;
        for (var i = start; i >= 0; i--) {
            var optionCmp = iters.getValue(i);
            if (optionCmp.get("v.visible") === true) {
                prev = i;
                break;
            }
        }
        if (prev >= iters.getLength()) { // If no visible is found above the current highlighted,  let's start from bottom.
            for (var j = iters.getLength() - 1; j > k; j--) {
                var optionCmp = iters.getValue(j);
                if (optionCmp.get("v.visible") === true) {
                    prev = j;
                    break;
                }
            }
        }
        return prev;
    },
    
    handleEsckeydown: function(component, event) {
        component.setValue("v.visible", false);
    },
    
    handleKeydown: function(component, event) {
        var keyCode = event.keyCode;
        if (event.keyCode === 39 || event.keyCode === 40) {  // right or down arrow key
            event.preventDefault();
            this.setFocusToNextItem(component, event);
        } else if (event.keyCode === 37 || event.keyCode === 38) {  // left or up arrow key
            event.preventDefault();
            this.setFocusToPreviousItem(component, event);
        } else if (event.keyCode === 27) {  // Esc key
            event.stopPropagation();
            this.handleEsckeydown(component, event);
        } else if (event.keyCode === 9) {  // tab key: dismiss the list
            this.handleTabkeydown(component, event);
        }
    },
    
    handleListHighlight: function(component, event) {
        var activeIndex = -1;
        var iterCmp = component.find("iter");
        if (iterCmp) {
            var iters = iterCmp.getValue("v.realbody");
            var index = event.getParam("activeIndex");
            if (index < 0) { // focus on the last visible option
                activeIndex = this.getPrevVisibleOption(iters, iters.getLength());
            } else { // focus on the first visible option
                activeIndex = this.getNextVisibleOption(iters, -1);
            }
            if (activeIndex >= 0 && activeIndex < iters.getLength()) {
                var focusEvent = iters.getValue(activeIndex).get("e.focus");
                if (focusEvent) {
                    focusEvent.fire();
                }
            }
        }
    },
    
    handleTabkeydown: function(component, event) {
        component.setValue("v.visible", false);
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
    },
    
    setFocusToNextItem: function(component, event) {
        var targetCmp = this.getEventSourceComponent(component, event); 
        var iterCmp = component.find("iter");
        if (iterCmp) {
            var iters = iterCmp.getValue("v.realbody");
            var nextIndex = 0;
            for (var k = 0; k < iters.getLength(); k++) {
                var iter = iters.getValue(k);
                if (iter.getGlobalId() == targetCmp.getGlobalId()) {
                    nextIndex = this.getNextVisibleOption(iters, k);
                    break;
                }
            }
            if (nextIndex >= 0 && nextIndex < iters.getLength()) {
                var focusEvent = iters.getValue(nextIndex).get("e.focus");
                if (focusEvent) {
                    focusEvent.fire();
                }
            }
        }
    },
    
    setFocusToPreviousItem: function(component) {
        var targetCmp = this.getEventSourceComponent(component, event); 
        var iterCmp = component.find("iter");
        if (iterCmp) {
            var iters = iterCmp.getValue("v.realbody");
            var prevIndex = 0;
            for (var k = 0; k < iters.getLength(); k++) {
                var iter = iters.getValue(k);
                if (iter.getGlobalId() == targetCmp.getGlobalId()) {
                    prevIndex = this.getPrevVisibleOption(iters, k);
                    break;
                }
            }
            if (prevIndex >= 0 && prevIndex < iters.getLength()) {
                var focusEvent = iters.getValue(prevIndex).get("e.focus");
                if (focusEvent) {
                    focusEvent.fire();
                }
            }
        }
    }
})
