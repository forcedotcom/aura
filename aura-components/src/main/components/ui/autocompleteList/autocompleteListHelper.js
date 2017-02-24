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
    findHighlightedOptionIndex: function (iters) {
        for (var i = 0; i < iters.length; i++) {
            var optionCmp = iters[i];
            if (optionCmp.get("v.visible") === true && optionCmp.get("v.highlighted") === true) {
                return i;
            }
        }
        return -1;
    },

    /**
     * Notify that the matching is done.
     */
    fireMatchDoneEvent: function (component, items) {
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

    fireDataProvideEvent: function(component, options, index) {
        // fire dataProvide event
        var dataProviders = component.get("v.dataProvider");
        if (!index) {
            index = 0;
        }
        var provideEvent = dataProviders[index].get("e.provide");
        provideEvent.setParams({
            parameters: options
        });
        provideEvent.fire();
    },

    fireAbortEvent: function(component, options, index) {
        // fire abort event
        var dataProviders = component.get("v.dataProvider");
        if (!index) {
            index = 0;
        }
        var abortEvent = dataProviders[index].get("e.abort");
        abortEvent.setParams({
            parameters: options
        });
        abortEvent.fire();
    },


    getEventSourceOptionComponent: function (component, event) {
        //option could be a compound component so look for the right option
        var element = event.target || event.srcElement;
        var targetCmp;
        do {
            var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
            if ($A.util.isUndefinedOrNull(htmlCmp)) {
                return null;
            }
            targetCmp = htmlCmp.getComponentValueProvider().getConcreteComponent();
            element = targetCmp.getElement().parentElement;
        } while (!targetCmp.isInstanceOf("ui:autocompleteOptionTemplate"));
        return targetCmp;
    },

    getOnClickEndFunction: function (component) {
        if ($A.util.isUndefined(component._onClickEndFunc)) {
            var helper = this;
            var i;
            var f = function (event) {
                // ignore gestures/swipes; only run the click handler if it's a click or tap
                var clickEndEvent;

                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touchIdFound = false;
                    for (i = 0; i < event.changedTouches.length; i++) {
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

                var listElems = component.getElements();
                var ignoreElements = component.get("v.ignoredElements");
                var clickOutside = true;
                if (listElems) {
                    var ret = true;
                    for (i = 0; ret; i++) {
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
                    component.set("v.visible", false);
                }
            };
            component._onClickEndFunc = f;
        }
        return component._onClickEndFunc;
    },

    getOnClickEventProp: function (prop) {
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

    getOnClickStartFunction: function (component) {
        if ($A.util.isUndefined(component._onClickStartFunc)) {
            var helper = this;
            var f = function (event) {
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

    handleDataChange: function (component, event) {
        var concreteCmp = component.getConcreteComponent();
        var newItems = event.getParam("data");
        // Users of the component that implement their own v.matchFunc rely on this being set.
        concreteCmp.set("v.items", newItems);
        if (concreteCmp.get("v.disableMatch") === true) {
            for (var j = 0; j < newItems.length; j++) {
                newItems[j].visible = true;
            }
            this.matchFuncDone(concreteCmp, newItems);
        } else {
            this.matchText(concreteCmp, newItems);
        }
    },

    handleListHighlight: function (component, event) {
        var selectedSection = this.createKeyboardTraversalList(component);
        
        if (selectedSection) {
            if(event.getParam("activeOption")) {
                selectedSection.deselect();
                event.getParam("activeOption").set("v.highlighted", true);
            } else {
                var direction = event.getParam("activeIndex");
                selectedSection.deselect();
                if (direction < 0) { // highlight previous visible option
                    selectedSection = selectedSection.decrement();
                } else { // highlight next visible option
                    selectedSection = selectedSection.increment();
                }
                selectedSection.select(component);
            }
        }
    },

    /* create a keyboard traversal list to simplify the logic of handling up/down keystrokes on the list */
    /* looks like this:  [header] <-> [items] <-> [footer] where header and footer are optional */
    createKeyboardTraversalList: function (component) {
        var selectedSection = null;
        var topSection = null;
        var bottomSection = null;
        var self = this;

        //create section for autocomplete list rows
        var itemsSection = this._createKeyboardTraversalItemsSection(component);
        var iterCmp = component.find("iter");
        if (!iterCmp) {
            return null;
        }
        itemsSection.iters = iterCmp.get("v.body");

        // original index points to the currently highlighted item or -1 if we're not in item list
        // highlightedIndex is used to determine the next item to highlight during traversal
        itemsSection.originalIndex = itemsSection.highlightedIndex = this.findHighlightedOptionIndex(itemsSection.iters);
        itemsSection.previous = itemsSection.next = topSection = bottomSection = itemsSection;
        // if highlightedIndex is not -1, we're inside the item list
        if (itemsSection.highlightedIndex > -1) {
            selectedSection = itemsSection;
        }

        //create section for autocomplete header
        var header = this.getHeader(component),
            unselectable = (header && header.isInstanceOf('ui:autocompleteListSelectable') && !header.get("v.selectable"));
        if (header && component.get("v.showListHeader") && !unselectable ) {
            var headerSection = this._createBasicKeyboardTraversalSection();
            headerSection.deselect = function () {
                component.set("v.headerSelected", false);
                $A.util.removeClass(header, "highlighted");
            };
            headerSection.select = function () {
                component.set("v.headerSelected", true);
                $A.util.addClass(header, "highlighted");
                self.updateAriaAttributesFromIdAttribute(component, header);
            };
            headerSection.next = headerSection.previous = itemsSection;
            topSection = itemsSection.next = itemsSection.previous = headerSection;
            if (!selectedSection && component.get("v.headerSelected")) {
                selectedSection = headerSection;
            }
        }

        //create section for autocomplete footer
        var footer = this.getFooter(component);
        unselectable = (footer && footer.isInstanceOf('ui:autocompleteListSelectable') && !footer.get("v.selectable"));
        if (footer && component.get("v.showListFooter") && !unselectable) {
            var footerSection = this._createBasicKeyboardTraversalSection();
            footerSection.deselect = function () {
                component.set("v.footerSelected", false);
                $A.util.removeClass(footer, "highlighted");
            };
            footerSection.select = function () {
                component.set("v.footerSelected", true);
                $A.util.addClass(footer, "highlighted");
                self.updateAriaAttributesFromIdAttribute(component, footer);
            };
            footerSection.next = topSection;
            footerSection.previous = itemsSection;
            bottomSection = itemsSection.next = topSection.previous = footerSection;
            if (!selectedSection && component.get("v.footerSelected")) {
                selectedSection = footerSection;
            }
        }

        //create an empty section for when nothing is selected
        if (!selectedSection) {
            selectedSection = this._createBasicKeyboardTraversalSection();
            selectedSection.previous = bottomSection;
            selectedSection.next = topSection;
        }
        return selectedSection;
    },

    /**
     * Creates a basic linked list node for list traversal.
     */
    _createBasicKeyboardTraversalSection: function () {
        return {
            increment: function () {
                return this.next.incrementedTo();
            },
            decrement: function () {
                return this.previous.decrementedTo();
            },
            incrementedTo: function () {
                return this;
            },
            decrementedTo: function () {
                return this;
            },
            deselect: function () { /*do nothing*/
            },
            select: function () {  /*do nothing*/
            }
        };
    },

    /**
     * Creates a linked list node for the item section. For the header and footer,
     * we use _createBasicKeyboardTraversalSection.
     */
    _createKeyboardTraversalItemsSection: function (cmp) {
        var self = this;
        return {
            // Counts how many times we have traversed the item section in increment/decrement.
            // We should only visit the item Section for as many times as the number of items - 1
            // (- 1 to not include original index).
            // Since we're using recursion here and we need to wrap around the list when there's
            // no header or footer, using a count is the most straightforward way to prevent infinite loop.
            traversalCount: 0,

            // select the next selectable item
            // if go past the last item, go to the next selectable section (header/footer)
            // if no selectale section, wrap around to the top and continue traversal
            increment: function () {
                var resultSection = this;
                var itemList = this.iters;

                this.highlightedIndex++;

                this.traversalCount++; // ++ before the check to loop only num of items-1 times
                if (this.traversalCount < itemList.length && this.highlightedIndex !== this.originalIndex) { 
                    // reached bottom
                    if (this.highlightedIndex >= itemList.length) {
                        this.highlightedIndex = -1;
                        // go to the next section; if not exists, it'll recurse to wrap around the list
                        resultSection = this.next.incrementedTo();
                    // go to the current item if selectable
                    } else if (!itemList[this.highlightedIndex].get("v.visible")) {
                        resultSection = this.incrementedTo();
                    }
                }
                return resultSection;
            },

            // select the previous selectable item
            // if go past the first item, go to the previous selectable section (header/footer)
            // if no selectale section, wrap around to the bottom and continue traversal
            decrement: function () {
                var resultSection = this;
                var itemList = this.iters;

                if (this.highlightedIndex < 0) {
                    this.highlightedIndex = itemList.length;
                }
                this.highlightedIndex--;

                this.traversalCount++; // ++ before the check to loop only num of items-1 times
                if (this.traversalCount < itemList.length && this.highlightedIndex !== this.originalIndex) {
                    // reached top
                    if (this.highlightedIndex < 0) {
                        this.highlightedIndex = -1;
                        // go to the previous section; if not exists, it'll recurse to wrap around the list
                        resultSection = this.previous.decrementedTo();
                    // go to the current item if selectable
                    } else if (!itemList[this.highlightedIndex].get("v.visible")) {
                        resultSection = this.decrementedTo();
                    }
                }
                return resultSection;
            },

            incrementedTo: function () {
                return this.increment();
            },

            decrementedTo: function () {
                return this.decrement();
            },

            deselect: function () {
                if (this.highlightedIndex !== -1) {
                    this.iters[this.highlightedIndex].set("v.highlighted", false);
                }
            },

            select: function () {
                if (this.highlightedIndex < 0 || this.highlightedIndex >= this.iters.length) {
                    return; // nothing selected
                }
                var highlightedCmp = this.iters[this.highlightedIndex];
                highlightedCmp.set("v.highlighted", true);
                var highlightedElement = highlightedCmp.getElement();
                self.scrollIntoViewIfNeeded(highlightedElement);
                self.updateAriaAttributes(cmp, highlightedCmp);
            }

        };
    },

    scrollIntoViewIfNeeded: function(element) {
        if (element) {
            if (element.scrollIntoViewIfNeeded) {
                element.scrollIntoViewIfNeeded();
            } else {
                if (!this.isInViewport(element)) {
                    element.scrollIntoView(false);
                }
            }
        }
    },

    isInViewport: function(element) {
        var rect = element.getBoundingClientRect();
        return (rect.top >= 0 && rect.bottom <= window.innerHeight);
    },

    addHeaderAndFooterClassesAndAttributes: function (component) {
        var header = this._getComponentByAttribute(component, "v.listHeader");
        if (header && header.getElement()) {
            $A.util.addClass(header, "lookup__header");
            header.getElement().setAttribute("id", header.getGlobalId());
            header.getElement().setAttribute("role", "option");
        }
        var footer = this._getComponentByAttribute(component, "v.listFooter");
        if (footer && footer.getElement()) {
            $A.util.addClass(footer, "lookup__footer");
            footer.getElement().setAttribute("id", footer.getGlobalId());
            footer.getElement().setAttribute("role", "option");
        }
    },

    getHeader: function (component) {
        return this._getComponentByAttribute(component, "v.listHeader");
    },

    getFooter: function (component) {
        return this._getComponentByAttribute(component, "v.listFooter");
    },

    _getComponentElementByAttribute: function (component, attribute) {
        return this._getComponentByAttribute(component, attribute).getElement();
    },

    _getComponentByAttribute: function (component, attribute) {
        var resultCmp = component.get(attribute);
        if ($A.util.isEmpty(resultCmp)) {
            return false;
        }
        if ($A.util.isArray(resultCmp)) {
            resultCmp = resultCmp[0];
        }
        return resultCmp;
    },


    handlePressOnHighlighted: function (component) {
        var optionSelectEvt;
        if (component.get("v.headerSelected")) {
            optionSelectEvt = component.get("e.selectListOption");
            optionSelectEvt.setParams({ option:  component.get("v.listHeader"), isHeader: true  });
            optionSelectEvt.fire();
        } else if (component.get("v.footerSelected")) {
            optionSelectEvt = component.get("e.selectListOption");
            optionSelectEvt.setParams({option: component.get("v.listFooter"), isFooter: true});
            optionSelectEvt.fire();
        }
        else {
            var iterCmp = component.find("iter");
            if (iterCmp) {
                var iters = iterCmp.get("v.body");
                var highlightedIndex = this.findHighlightedOptionIndex(iters);
                if (highlightedIndex >= 0) {
                    var targetCmp = iters[highlightedIndex];
                    var selectEvt = component.get("e.selectListOption");
                    selectEvt.setParams({
                        option: targetCmp
                    });
                    selectEvt.fire();
                }
            }
        }
    },

    handleTabkeydown: function (component) {
        component.set("v.visible", false);
    },

    hasVisibleOption: function (items) {
        var hasVisibleOption = false;
        for (var i = 0; i < items.length; i++) {
            if (items[i].visible === true) {
                hasVisibleOption = true;
                break;
            }
        }

        return hasVisibleOption;
    },

    /**
     * Checks if the object is an HTML element.
     * @param {Object} obj
     * @returns {Boolean} True if the object is an HTMLElement object, or false otherwise.
     */
    isHTMLElement: function (obj) {
        if (typeof HTMLElement === "object") {
            return obj instanceof HTMLElement;
        } else {
            return typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string";
        }
    },

    matchFunc: function (component, items) {
        items = items || component.get('v.items');
        var keyword = component.get("v.keyword");
        var propertyToMatch = component.get("v.propertyToMatch");
        try {
            for (var j = 0; j < items.length; j++) {
                items[j].keyword = keyword;
                var label = items[j][propertyToMatch];
                if (keyword && label.toLowerCase().indexOf(keyword.toLowerCase()) >= 0) { // Has a match
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
    },

    matchFuncDone: function (component, items) {
        items = items || component.get('v.items');
        this.toggleListVisibility(component, items);

        // If a loading indicator delay was set, clear it
        if (component._loadingTimer) {
            clearTimeout(component._loadingTimer);
            component._loadingTimer = null;
        }
        this.showLoading(component, false);

        component.set("v.privateItems", items);

        this.fireMatchDoneEvent(component, items);
    },

    matchText: function (component, items) {
        var action = component.get("v.matchFunc");
        if (action) {
            action.setCallback(this, function() {
                //@dval: Refactor all this nonsense:
                // - it should not be an action but js function
                // - it should not have the responsability to set the items directly
                // - we should not fire yet another stupid event since we are in the callback

                //this.matchFunc(component, items);
                this.matchFuncDone(component, items);
            });
            action.setParams({items: items});
            $A.enqueueAction(action);
        } else {
            this.matchFunc(component, items);
            this.matchFuncDone(component, items);
        }
    },

    toggleListVisibility: function (component, items) {
        var showEmptyListContent = !$A.util.isEmpty(component.get("v.emptyListContent")) && (component.get("v.showEmptyList") || !$A.util.isEmpty(component.get("v.keyword")));
        var hasVisibleOption = this.hasVisibleOption(items);
        component.set("v.visible", hasVisibleOption || showEmptyListContent);
    },

    updateAriaAttributesFromIdAttribute: function (component, highlightedCmp) {
        var highlightedElement = highlightedCmp.getElement();
        if (highlightedElement) {
            var updateAriaEvt = component.get("e.updateAriaAttributes");
            if (updateAriaEvt) {
                updateAriaEvt.setParams({
                    attrs: { "aria-activedescendant": highlightedElement.getAttribute("id") }
                });
                updateAriaEvt.fire();
            }
        }
    },

    updateAriaAttributes: function (component, highlightedCmp) {
        var updateAriaEvt = component.get("e.updateAriaAttributes");
        if (updateAriaEvt) {
            var obj = {
                "aria-activedescendant": highlightedCmp&&highlightedCmp.isInstanceOf("ui:autocompleteOption")?highlightedCmp.get("v.domId"):""
            };
            updateAriaEvt.setParams({
                attrs: obj
            });
            updateAriaEvt.fire();
        }
    },

    updateEmptyListContent: function (component) {
        var visible = component.getConcreteComponent().get("v.visible");
        var items = component.getConcreteComponent().get("v.items");
        var hasVisibleOption = this.hasVisibleOption(items);

        $A.util.toggleClass(component, "showEmptyContent", visible && !hasVisibleOption);
    },

    showLoading: function (component, visible) {
        $A.util.toggleClass(component, "loading", visible);

        // Originally, no loading indicator was shown. Making it only appear when specified in the facet.
        if (!$A.util.isEmpty(component.get("v.loadingIndicator"))) {
            var list = component.find("list");
            $A.util.toggleClass(list, "invisible", !visible);
        }
    },
    
    setDefaultHighlight: function(component) {
    	var setDefaultHighlight = component.get("v.setDefaultHighlight");
    	var visible = component.get("v.visible");
    	if (visible !== true) {
    		return; 
    	}
    	var iterCmp = component.find("iter");
    	if (iterCmp) {
    		var iters = iterCmp.get("v.body");
    		var found = false;
    	    for (var i = 0; i < iters.length; i++) {
                var optionCmp = iters[i];
                if (setDefaultHighlight && found === false && optionCmp.get("v.visible") === true) {
                    optionCmp.set("v.highlighted", true);
                    this.updateAriaAttributes(component, optionCmp);
                    found = true;
                } else {
                	optionCmp.set("v.highlighted", false);
                }
            }
            if (!found) {
                this.updateAriaAttributes(component, null);
            }
    	}
    },
    
    setUpEvents: function (component, onVisibleChange) {
        if (component.isRendered()) {
            var obj = {};
            var visible = component.get("v.visible");

            // Should no longer be necessary. We do this in an expression now on the list
            //var list = component.find("list");
            //$A.util.toggleClass(list, "visible", visible);

            // auto complete list is hidden.
            if (visible === false) {
                // Remove loading indicator
                obj["aria-activedescendant"] = "";
                obj["aria-expanded"] = false;
                // De-register list expand/collapse events
                $A.util.removeOn(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
                $A.util.removeOn(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));
                
                if (onVisibleChange) {
	                //push this even to the end of the queue to ensure that the interation in the component body is complete
	                window.setTimeout($A.getCallback(function () {
	                    if (component.isValid()) {
	                        component.get("e.listCollapse").fire();
	                    }
	                }, 0));
                }
                
            } else { // Register list expand/collapse events
                obj["aria-expanded"] = true;
                $A.util.on(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
                $A.util.on(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));

                if (onVisibleChange) {
	                //push this even to the end of the queue to ensure that the interation in the component body is complete
	                window.setTimeout($A.getCallback(function () {
	                    if (component.isValid()) {
	                        component.get("e.listExpand").fire();
	                    }
	                }, 0));
                }

            }


            // Update accessibility attributes
            var updateAriaEvt = component.get("e.updateAriaAttributes");
            if (updateAriaEvt) {
                updateAriaEvt.setParams({
                    attrs: obj
                });
                updateAriaEvt.fire();
            }
        }
    },

    positionList: function(component) {
        var listReferenceComponent = component.get("v.listReferenceComponent");
        if ($A.util.isEmpty(listReferenceComponent) || $A.util.isUndefinedOrNull(listReferenceComponent[0]) || !component.get("v.visible")) {
            return;
        }

        var referenceElement = listReferenceComponent[0].getElement();
        var listElement = component.getElement();

        //get reference element rect
        var referenceElementRect = referenceElement.getBoundingClientRect();

        //get parent component rect
        listElement.style.left = "0"; // reset the position to obtain the correct relative difference
        var listElementParentRect = listElement.getBoundingClientRect();

        //set left position
        var relativeLeft = referenceElementRect.left - listElementParentRect.left;
        listElement.style.left = relativeLeft +"px";
    }
})// eslint-disable-line semi
