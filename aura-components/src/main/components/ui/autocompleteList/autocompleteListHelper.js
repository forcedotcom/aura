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
     * Find out the current highlighted option.
     * @return the index of the highlighted component; -1 if no opton is highlighted now.
     */
    findHighlightedOptionIndex: function(iters) {
        for (var i = 0; i < iters.getLength(); i++) {
            var optionCmp = iters.getValue(i);
            if (optionCmp.get("v.visible") === true && optionCmp.get("v.highlighted") === true) {
                return i;
                break;
            }
        }
        return -1;
    },
    
    /**
     * Notify that the matching is done.
     */
    fireMatchDoneEvent: function(component, items) {
        var size = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].visible === true) {
                size++;
            }
        }
        var evt = component.get("e.matchDone");
        if (evt) {
            evt.setParams({
                size: size
            });
            evt.fire();
        }
    },
    
    getEventSourceComponent: function(component, event) {
        var element = event.target || event.srcElement;
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        return htmlCmp.getAttributes().getComponentValueProvider().getConcreteComponent();
    },
    
    getNextVisibleOption: function(iters, k) {
        var next = -1;
        var start = k >= iters.getLength() - 1 ? 0 : k + 1;
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
    
    getOnClickEndFunction : function(component) {
        if ($A.util.isUndefined(component._onClickEndFunc)) {
            var helper = this;
            var f = function(event) {
                // ignore gestures/swipes; only run the click handler if it's a click or tap
                var clickEndEvent;
            
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touchIdFound = false;
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        clickEndEvent = event.changedTouches[i];
                        if (clickEndEvent.identifier === component._onStartId) {
                            touchIdFound = true;
                            break;
                        }
                    }
                
                    if (helper.getOnClickEventProp("isTouchDevice") && !touchIdFound) {
                        return;
                    }
                } else {
                    clickEndEvent = event;
                }
            
                var startX = component._onStartX, startY = component._onStartY;
                var endX = clickEndEvent.clientX, endY = clickEndEvent.clientY;

                if (Math.abs(endX - startX) > 0 || Math.abs(endY - startY) > 0) {
                    return;
                }
            
                var listElems = component.getElements();
                var ignoreElements = component.get("v.elementsToIgnoreClicking");
                var clickOutside = true;
                if (listElems) {
                    var ret = true;
                    for (var i = 0; ret; i++) {
                        ret = listElems[i];
                        if (ret && helper.isHTMLElement(ret) && $A.util.contains(ret, event.target)) {
                            clickOutside = false;
                            break;
                        }
                    }
                }
                if (ignoreElements && clickOutside === true) {
                    var ret2 = true;
                    for (var j = 0; ret2; j++) {
                        ret2 = ignoreElements[j];
                        if (ret2 && helper.isHTMLElement(ret2) && $A.util.contains(ret2, event.target)) {
                            clickOutside = false;
                            break;
                        }
                    }
                }
                if (clickOutside === true) {
                    // Collapse the menu
                    component.setValue("v.visible", false);
                }
            };
            component._onClickEndFunc = f;
        }
        return component._onClickEndFunc;
    },
    
    getOnClickEventProp: function(prop) {
        // create the cache
        if ($A.util.isUndefined(this.getOnClickEventProp.cache)) {
            this.getOnClickEventProp.cache = {};
        }

        // check the cache
        var cached = this.getOnClickEventProp.cache[prop];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        // fill the cache
        this.getOnClickEventProp.cache["isTouchDevice"] = !$A.util.isUndefined(document.ontouchstart);
        if (this.getOnClickEventProp.cache["isTouchDevice"]) {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "touchstart";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "touchend";
        } else {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "mousedown";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "mouseup";
        }
        return this.getOnClickEventProp.cache[prop];
    },
    
    getOnClickStartFunction: function(component) {
        if ($A.util.isUndefined(component._onClickStartFunc)) {
            var helper = this;
            var f = function(event) {
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touch = event.changedTouches[0];
                    // record the ID to ensure it's the same finger on a multi-touch device
                    component._onStartId = touch.identifier;
                    component._onStartX = touch.clientX;
                    component._onStartY = touch.clientY;
                } else {
                    component._onStartX = event.clientX;
                    component._onStartY = event.clientY;
                }
            };
            component._onClickStartFunc = f;
        }
        return component._onClickStartFunc;
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
    
    handleDataChange: function(component, event) {
        var concreteCmp = component.getConcreteComponent();
        concreteCmp.getValue("v.items").setValue(event.getParam("data"));
        this.matchText(concreteCmp); 
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
            var highlightedIndex = this.findHighlightedOptionIndex(iters);
            var index = event.getParam("activeIndex");
            if (index < 0) { // highlight previous visible option
                activeIndex = highlightedIndex < 0 ? this.getPrevVisibleOption(iters, iters.getLength())
                                                   : this.getPrevVisibleOption(iters, highlightedIndex);
            } else { // highlight next visible option
                activeIndex = highlightedIndex < 0 ? this.getNextVisibleOption(iters, -1)
                                                   : this.getNextVisibleOption(iters, highlightedIndex);
            }
            if (activeIndex >= 0 && activeIndex < iters.getLength() && activeIndex != highlightedIndex) {
                if (highlightedIndex >= 0) {
                    iters.getValue(highlightedIndex).setValue("v.highlighted", false);
                }
                var highlightedCmp = iters.getValue(activeIndex);
                highlightedCmp.setValue("v.highlighted", true);
                this.updateAriaAttributes(component, highlightedCmp);
            }
        }
    },
    
    handlePressOnHighlighted: function(component, event) {
        var iterCmp = component.find("iter");
        if (iterCmp) {
            var iters = iterCmp.getValue("v.realbody");
            var highlightedIndex = this.findHighlightedOptionIndex(iters);
            if (highlightedIndex >= 0) {
                var targetCmp = iters.getValue(highlightedIndex);
                var selectEvt = component.get("e.selectListOption");
                selectEvt.setParams({
                    option: targetCmp
                });
                selectEvt.fire();
            }
        }
    },
    
    handleTabkeydown: function(component, event) {
        component.setValue("v.visible", false);
    },
    
    /**
     * Checks if the object is an HTML element.
     * @param {Object} obj
     * @returns {Boolean} True if the object is an HTMLElement object, or false otherwise.
     */
    isHTMLElement: function(obj) {
        if (typeof HTMLElement === "object") {
            return obj instanceof HTMLElement;
        } else {
            return typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName==="string";
        }
    },
    
    matchText: function(component) {
        var keyword = component.get("v.keyword");
        var propertyToMatch = component.get("v.propertyToMatch");
        var items = component.get("v.items");
        var regex;
        try {
            regex = new RegExp(keyword, "i");
            for (var j = 0; j < items.length; j++) {
                items[j].keyword = keyword;
                var label = items[j][propertyToMatch];
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
        this.fireMatchDoneEvent(component, items);
        this.toggleListVisibility(component, items);
        this.showLoading(component, false);
    },
    
    toggleListVisibility: function(component, items) {
        var hasVisibleOption = false;
        for (var i = 0; i < items.length; i++) {
            if (items[i].visible === true) {
                hasVisibleOption = true;
                break;
            }
        }
        component.setValue("v.visible", hasVisibleOption);
    },
    
    updateAriaAttributes: function(component, highlightedCmp) {
        var optionCmp = highlightedCmp.find("option");
        var elem = optionCmp ? optionCmp.getElement() : null;
        var updateAriaEvt = component.get("e.updateAriaAttributes");
        if (elem && updateAriaEvt) {
            var obj = {
                "aria-activedescendant": elem.id
            };
            updateAriaEvt.setParams({
                attrs: obj
            })
            updateAriaEvt.fire();
        }
    }
})
