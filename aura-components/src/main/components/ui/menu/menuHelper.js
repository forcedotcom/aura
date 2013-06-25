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
    getMenuComponent : function(component){
        return this.getComponent(component, "ui:menuList");
    },
    
    getTriggerComponent : function(component){
    	return this.getComponent(component, "ui:menuTrigger");
    },
    
    getComponent: function(component,cmpName){
        var concrete = component.getConcreteComponent();
        var body = concrete.getValue("v.body");
        if(!$A.util.isUndefinedOrNull(cmpName)){
	        for (var i = 0; i < body.getLength(); i++) {
	            var c = body.getValue(i);
	            if (c.isInstanceOf(cmpName)) {
	                return c;
	            }
	        }
        }
    },
    
    isElementInComponent : function(component, targetElem) {
        var componentElements = [];

        //grab all the siblings
        var elements = component.getElements();
        for(var index in elements) {
            if (elements.hasOwnProperty(index)){
                componentElements.push(elements[index]);
            }
        }

        //go up the chain until it hits either a sibling or the root
        var currentNode = targetElem;

        do {
            for (var index = 0; index < componentElements.length ; index++) {
                if (componentElements[index] === currentNode) { return true; }
            }

            currentNode = currentNode.parentNode;
        } while(currentNode);

        return false;
    },
    
    findMenuListDiv: function(menuComponent) {
         // find ui:menuList component
         var listCmp = menuComponent;
         var listCmpDes = listCmp.getDef().getDescriptor();
         var ns = listCmpDes.getNamespace();
         var name = listCmpDes.getName();
         while (listCmp && listCmp.isInstanceOf("ui:menuList")) {
             if ("ui:menuList" == (ns + ":" + name)) {
                 return listCmp.find("menu");
             }
             listCmp = listCmp.getSuper();
             listCmpDes = listCmp.getDef().getDescriptor();
             ns = listCmpDes.getNamespace();
             name = listCmpDes.getName();
         }
         return null;
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
            
                var menuComponent = helper.getMenuComponent(component);
                var triggerComponent = helper.getTriggerComponent(component);
                if (!helper.isElementInComponent(menuComponent, event.target) && 
                        !helper.isElementInComponent(triggerComponent, event.target)) {
                    // Collapse the menu
                    menuComponent.setValue("v.visible", false); 
                    var divCmp = helper.findMenuListDiv(menuComponent);
                    if (divCmp) {
                        var elem = divCmp.getElement();
                        $A.util.removeClass(elem, "visible");
                    }
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
    
    toggleMenuVisible : function(component, index) {
    	var c = this.getMenuComponent(component);
        c.setValue("v.focusItemIndex", index);
        var menuVisible = c.get("v.visible");
        c.setValue("v.visible", !menuVisible);
    }
})
