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
	 /*
     * Grab all the associated HTML and aura components based on the concrete component
     * since we need to reference them multiple times in this helper. This provides that we
     * only query for the components once, instead of each time a method is called.
     */
    getElementCache: function(component) {
    	var o;
    	
    	if (!component._localElementCache) {
    		o = {};
        	o.target = component.getConcreteComponent(); // the instance of popupTarget
        	o.targetElement = o.target.getElement(); // the root html element
        	
        	if (component.find("popupTarget")) { // this prevents extended components from throwing an error because they don't contain this element
        		o.targetDiv = component.find("popupTarget").getElement(); // the actual menu looking container that gets positioned relative to the trigger
        	}
        	
        	o.triggerElement = component.getConcreteComponent().get("v.referenceElement");
        	if (o.triggerElement) {
        	    o.trigger = this.getTriggerComponent(o.triggerElement);
        	}
        	component._localElementCache = o;
    	}

    	return component._localElementCache;
    },
    
    getTransitionEndEventName : function(component) {
        var el,
	        names;
        
        if (!component._transitionEndEventName) {
        	el = document.createElement('div');
	        names = {
	            'transition':'transitionend',
	            'OTransition':'otransitionend',
	            'MozTransition':'transitionend',
	            'WebkitTransition':'webkitTransitionEnd'
	        };
        	
	        for (var i in names) {
	        	if (names.hasOwnProperty(i) && typeof el.style[i] !== 'undefined') {
	            	component._transitionEndEventName = names[i];
	            }
	        }
    	}
    
    	return component._transitionEndEventName;
    },
    
    getTriggerComponent: function(element) {
    	var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        var component = htmlCmp.getComponentValueProvider().getConcreteComponent();
        while (component && !component.isInstanceOf("ui:popupTrigger")) {
        	component = component.getComponentValueProvider().getConcreteComponent();
        }
        return component;
    },
    
    position: function(component) {
    	var elements = this.getElementCache(component),
            attachToBody = elements.target.get("v.attachToBody"),
    		manualPosition = elements.target.get("v.manualPosition"),
    		visible,
	        autoPosition, 
	        elemRect,
	        viewPort, 
	        height;

    	if (attachToBody === true) {
    		this.positionAsBodyChild(component);
    		return;
    	}
    	
        if (elements.targetDiv && !manualPosition) {
        	elements.targetDiv.style.top = "auto";
            visible = elements.target.get("v.visible");
            
            if (visible) {
            	autoPosition = component.get('v.autoPosition');
                elemRect = elements.targetDiv.getBoundingClientRect();
                viewPort = $A.util.getWindowSize();
                
                if (autoPosition && elemRect.bottom > viewPort.height) { // no enough space below
                	// getBoundingClientRect method does not return height and width in IE7 and Ie8
                	height = typeof elemRect.height != 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;
                	elements.targetDiv.style.top = 0 - height + "px";
                } else {
                    elements.targetDiv.style.top = "auto";
                }
            }
        }
    },
    
    positionAsBodyChild: function(component) {
    	var elements = this.getElementCache(component),
    		visible,
    		manualPosition,
    		triggerElementRect,
    		elemRect,
    		viewPort,
    		width,
    		height;

    	if (elements.targetDiv && elements.triggerElement) {
            visible = elements.target.get("v.visible");
            
            if (visible) {
            	manualPosition = elements.target.get("v.manualPosition");
            	$A.util.attachToDocumentBody(component.getElement());
            	
            	if (!manualPosition) {
	            	triggerElementRect = elements.triggerElement.getBoundingClientRect();
	                elemRect = elements.targetDiv.getBoundingClientRect();
	                viewPort = $A.util.getWindowSize();
	                
	                // Vertical alignment
	                // getBoundingClientRect method does not return height and width in IE7 and Ie8
	                height = typeof elemRect.height != 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;
	                if ((viewPort.height - triggerElementRect.bottom) < height) { // no enough space below
	                	if (triggerElementRect.top < height) { // no enough space above either. Put it in the middle then
	                		elements.targetDiv.style.top = window.scrollY + "px";
	                	} else { // put it above
	                		elements.targetDiv.style.top = (triggerElementRect.top - height) + window.scrollY + "px";
	                	}
	                } else { // put it below
	                    elements.targetDiv.style.top = triggerElementRect.bottom + window.scrollY + "px";
	                }
	                
	                // Horizontal alignment
	                // getBoundingClientRect method does not return height and width in IE7 and Ie8
	                width = typeof elemRect.width != 'undefined' ? elemRect.width : elemRect.right - elemRect.left;
	                if (triggerElementRect.left < 0) {
	                	elements.targetDiv.style.left = window.scrollX + "px";
	                } else {
	                    if ((viewPort.width - triggerElementRect.left) < width) { // no enough space to the right
	                	    if (triggerElementRect.right < width) { // no enough space to the left either. Put it in the middle then.
	                		    elements.targetDiv.style.left = (viewPort.width - width) + window.scrollX + "px";
	                	    } else { // align at the right
	                		    elements.targetDiv.style.left = triggerElementRect.right - width + window.scrollX + "px";
	                	    }
	                    } else { // align at the left
	                        elements.targetDiv.style.left = triggerElementRect.left + window.scrollX + "px";
	                    }
	                }
            	}
            }
        }
    },
    
    setAriaAttributes: function(component) {
    	var elements = this.getElementCache(component);
    	
    	if (elements.triggerElement && elements.target) {
    		elements.targetElement.setAttribute("aria-labelledby", elements.trigger.getGlobalId());
        }
    },
    
    /*
     * Fires public events when menu expands or collapses
     */
    onVisibleChange : function(component) {
    	var elements = this.getElementCache(component),
			visible = elements.target.get("v.visible"),
			transitionEndEventName = this.getTransitionEndEventName(component),
			hideFunc;
	
	    if (elements.target.get('v.closeOnClickOutside') || elements.target.get('v.closeOnClickInside')) {
	        if (visible === true) {
	        	this.addDismissEvents(component);
	        } else {
	        	this.removeDismissEvents(component);
	        }
	    }
	    
	    // this function is called when css transitions are completed on target
	    // it is stored in a variable since $A.util.removeOn requires that you pass the attached function as 3rd param
	    hideFunc = function() {
			$A.util.addClass(elements.targetElement, component.get('v.preTransitionClass'));
			$A.util.removeOn(elements.targetElement, transitionEndEventName, hideFunc);
		}
	    
	    // setTimeout is so we can wait for the next life cycle to apply visible classes
	    // or else CSS transitions will not work when the target is appended to the body
	    // at the same time the visible property is changed
	    setTimeout(function() {
		    if (visible === true) {
	        	$A.util.removeClass(elements.targetElement, component.get('v.preTransitionClass'));
	        	$A.util.addClass(elements.targetElement, "visible");
	        	elements.target.get("e.popupExpand").fire();
	        } else {
	        	$A.util.on(elements.targetElement, transitionEndEventName, hideFunc, false);
	        	$A.util.removeClass(elements.targetElement, "visible");
	        	elements.target.get("e.popupCollapse").fire();
	        }
	    }, 0);
    },
    
    getOnClickEventProp: function(prop) {
    	var cached;
    	
        // create the cache
        if ($A.util.isUndefined(this.getOnClickEventProp.cache)) {
            this.getOnClickEventProp.cache = {};
        }

        // check the cache
        cached = this.getOnClickEventProp.cache[prop];
        
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
        var helper,
        	func;

        if ($A.util.isUndefined(component._onClickStartFunc)) {
            helper = this;
            func = function(event) {
            	var touch;
            	
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    touch = event.changedTouches[0];
                    // record the ID to ensure it's the same finger on a multi-touch device
                    component._onStartId = touch.identifier;
                    component._onStartX = touch.clientX;
                    component._onStartY = touch.clientY;
                } else {
                    component._onStartX = event.clientX;
                    component._onStartY = event.clientY;
                }
            };
            
            component._onClickStartFunc = func;
        }
    	
        return component._onClickStartFunc;
    },
    
    getOnClickEndFunction : function(component) {
    	var helper,
    		func;
    	
        if ($A.util.isUndefined(component._onClickEndFunc)) {
            helper = this;
            func = function(event) {
                // ignore gestures/swipes; only run the click handler if it's a click or tap
                var elements = helper.getElementCache(component),
                	clickEndEvent,
                	touchIdFound,
                	startX,
                	endX,
                	doIf = {
	                	clickIsInsideTarget : helper.isElementInComponent(elements.target, event.target),
	            		clickIsInsideTrigger : helper.isElementInComponent(elements.trigger, event.target),
                		closeOnClickInside : component.get('v.closeOnClickInside'),
                		closeOnClickOutside : component.get('v.closeOnClickOutside'),
                		triggerIsCustom : elements.trigger.get('v.trigger').length > 0,
                		clickIsInCurtain : $A.util.hasClass(event.target, 'popupCurtain')
                	};

                if (helper.getOnClickEventProp("isTouchDevice")) {
                    touchIdFound = false;
                    
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        clickEndEvent = event.changedTouches[i];
                        
                        if (clickEndEvent.identifier === component._onStartId) {
                            touchIdFound = true;
                            break;
                        }
                    }
                
                    startX = component._onStartX; 
                    startY = component._onStartY;
                    endX = clickEndEvent.clientX; 
                    endY = clickEndEvent.clientY;
                    
                    if (Math.abs(endX - startX) > 0 || Math.abs(endY - startY) > 0) {
                        return;
                    }
                    
                    if (helper.getOnClickEventProp("isTouchDevice") && !touchIdFound) {
                        return;
                    }
                } else {
                    clickEndEvent = event;
                }
                
                if (
                	(doIf.clickIsInsideTarget && doIf.closeOnClickInside) // if click is in target and v.closeonclickinside is true
                	|| (!doIf.clickIsInsideTarget && doIf.closeOnClickOutside && !doIf.clickIsInsideTrigger) // if click is out of target and out of trigger and v.closeOnClickOutside is true
                	|| doIf.clickIsInCurtain // or if the user is clicking the curtain
                ) {       
                	component.getConcreteComponent().get("e.doClose").fire();
                }
            };
            
            component._onClickEndFunc = func;
        }
        
        return component._onClickEndFunc;
    },
    
    getWindowBlurHandler : function(component) {
        if ($A.util.isUndefined(component._windowBlurHandlerFunc)) {
        	var elements = this.getElementCache(component);
        	
        	component._windowBlurHandlerFunc = function (event) {
        		elements.target.set("v.visible", !elements.target.get("v.visible"));
        	}
        }
        
        return component._windowBlurHandlerFunc;
    },
    
    isElementInComponent : function(component, targetElem) {
    	var currentNode = targetElem,
    		componentElements,
    		elements;
    	
    	if (!component || !targetElem) {
    		return false;
    	}
    	
        componentElements = component.getElements();
        
        // while currentNode is not false, climb the component tree
        // to see if we find a component with the same name as the 
        // parent component passed in as a parameter
        do {
            for (var i = 0, l = componentElements.length; i < l; i++) {
                if (componentElements[i] === currentNode) { 
                	return true; 
                }
            }
            
            // keep going until there are no more parentNodes
            currentNode = currentNode.parentNode;
        } while (currentNode);

        return false;
    },
    
    addDismissEvents : function(component) {
    	$A.util.on(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
        $A.util.on(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));        
        // window blur event is to hide/show menu when clicking on an iframe (as events do not bubble up and out of an iframe)
        $A.util.on(window, "blur", this.getWindowBlurHandler(component));
    },
    
    removeDismissEvents : function(component) {
    	$A.util.removeOn(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
    	$A.util.removeOn(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));
    	$A.util.removeOn(window, "blur", this.getWindowBlurHandler(component));
    },

    /*
     * This method is here for components that extend this one to hook into keyboard events
     */
    handleKeyboardEvent : function(component, event) {
    }
})