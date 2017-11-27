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
    // Store a unique id on the element to track for event deduping.
    DATA_UID_KEY: "data-interactive-uid",

	/**
	 * We can't just add and remove the handler for dom events, we need
	 * to wrap it in a getCallback() call. Which we then need to remove at a
	 * later time. So we need to keep a reference from the component to the
	 * event handler to properly remove it later.
	 */
	domEventMap: {},
    interactiveUid: 1,

    /**
     * Adds an event handler for every DOM event for which this input has a Aura-equivalent handler
     */
    addDomEvents : function(component) {
        var events = this.getHandledDOMEvents(component);
        //work around for bug W-1744442
        var concrete = component.getConcreteComponent();
        var helper = concrete.helper || this;
        for (var event in events) {
            helper.addDomHandler(component, event);
        }
    },

    /**
     * Adds an event handler for the given DOM event
     */
    addDomHandler : function(component, event) {
        var element = component.getElement();
        if (element === null) {
            $A.warning("Can't add handler to component because didn't have valid html element. Component was " + JSON.stringify(component));
            return ;
        }
        var elementId = this.getUid(element) || this.newUid(element);

        var handler = $A.getCallback(this.domEventHandler);
        $A.util.on(element, event, handler);

        // We're doing this cause of the $A.getCallback() we need to wrap domEventHandler in.
        // Since its a new function, we lose native dom deduping. So we ensure we only add one per component
        // per event.
        if(!this.domEventMap[elementId]) {
        	this.domEventMap[elementId] = {};
        }

        // Already present, so we'll need to remove it before adding it.
        var existing = this.domEventMap[elementId][event];
        if(existing) {
        	// If we've already added a handler for this component / event combo, remove it first.
        	$A.util.removeOn(element, event, existing);
        }

        this.domEventMap[elementId][event] = handler;
    },

    /**
     * Get the unique ID on the dom element. Does not add a unique ID if one does not exist.
     */
    getUid: function(element) {
        return element ? element.getAttribute(this.DATA_UID_KEY) : null;
    },

    /**
     * Generate a new UID on the dom element to track unique dom elements.
     */
    newUid: function(element) {
        var nextUid = ++this.interactiveUid;
        element.setAttribute(this.DATA_UID_KEY, nextUid);
        return nextUid;
    },

    /**
     * We track event listeners added from a component to its elements.
     * When we unrender the component, we should delete our entries in the map so
     * the Map doesn't continiously grow.
     */
    removeDomEventsFromMap:  function(component) {
        var element = component.getElement();
        if (!element) {
            return;
        }

        var elementId = this.getUid(element);

        // clean up handler references and map entries
        if(elementId && this.domEventMap.hasOwnProperty(elementId)) {
            var eventHandlers = this.domEventMap[elementId];
            for (var event in eventHandlers) {
                var existing = eventHandlers[event];
                if(existing) {
                    $A.util.removeOn(element, event, existing);
                }
            }

            delete this.domEventMap[elementId];
        }
    },

    /**
     * Handles a DOM-level event and throws the Aura-level equivalent.
     *
     * This same function is used for all DOM->Aura event wireup on components, which has multiple benefits:
     * - decreased memory footprint
     * - no need to protect against a handler being added more than once
     * - no need to track event->handler function mappings for later removal
     */
    domEventHandler : function (event) {
        var element = event.currentTarget || event.target;
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);

        // cmp might be destroyed, just ignore this event.
        if (!htmlCmp) {
            return;
        }

        var component = htmlCmp.getComponentValueProvider().getConcreteComponent();
        var helper = component.helper;

        if (!helper || component._recentlyClicked) {
            return;
        }

        // extended components can do some event processing before the Aura event gets fired
        if (helper.preEventFiring) {
            helper.preEventFiring(component, event);
        }

        // fire the equivalent Aura event
        if (helper.fireEvent) {
            helper.fireEvent(component, event, helper);
        }

        if (event.type === "click" && component.isInstanceOf("ui:doubleClicks") && component.get("v.disableDoubleClicks")) {
        	component._recentlyClicked = true;
        	window.setTimeout(function() { component._recentlyClicked = false; }, 350);
        }
    },

    /**
     * Fire the equivalent Aura event for DOM one.
     * This can be overridden by extended component
     *
     * @param event must be a DOM event
     */
     fireEvent : function (component, event, helper) {
    	 // As the result as another event
    	 // this component could become invalid, so guard just in-case
    	 if(component.isValid()) {
	        var e = component.getEvent(event.type);
	        helper.setEventParams(e, event);
	        e.setComponentEvent();
	        e.fire();
    	 }
     },

    /**
     * Returns the list of valid DOM events this component may handle
     *
     * NOTE: this currently assumes that interactive.cmp only handles events that are valid DOM events.
     * We may wish to change this to an explicit list at some point.
     */
    getDomEvents : function(component) {
        return component.getDef().getAllEvents();
    },

    /**
     * Returns an object whose keys are the lower-case names of DOM-equivalent Aura events for which this component currently has handlers
     */
    getHandledDOMEvents : function(component){
        var ret = {};
        var handledEvents = component.getHandledEvents();
        var domEvents = this.getDomEvents(component);

        if(domEvents){
            for(var i=0,len=domEvents.length; i<len; i++){
                var eventName = domEvents[i].toLowerCase();
                if (handledEvents[eventName]) {
                    ret[eventName] = true;
                }
            }
        }
        return ret;
    },

    /**
     * This method is intended to be overridden by extended components to do event related stuff before the event gets fired.
     * For example, input component uses this method to update its value if the event is the "updateOn" event.
     */
    preEventFiring : function(){
    },

    /**
     * Set event's parameters with the value from DOM event.
     * The event's parameter name should be the same as the property name in DOM event.
     */
    setEventParams : function(e, DOMEvent) {
        // set parameters if there is any
        var attributeDefs = e.getDef().getAttributeDefs().getNames();
        var attribute;
        var params = {};
        for (var c=0,length=attributeDefs.length;c<length;c++) {
            attribute = attributeDefs[c];
            if (attribute === "domEvent") {
                params[attribute] = DOMEvent;
            } else if (attribute === "keyCode") { // we need to re-visit this keyCode madness soon
                params[attribute] = DOMEvent.which || DOMEvent.keyCode;
            } else {
                params[attribute] = DOMEvent[attribute];
            }
        }
        e.setParams(params);
    },

    /**
     * Toggle a component's disabled state and an optional CSS class.
     * @param {Component} component The component being toggled.
     * @param {Boolean} disabled True to set disabled; false for enabled.
     * @param {String} disabledCss Optional css class to apply when disabled, and remove when enabled.
     */
    setDisabled: function(component, disabled, disabledCss) {
        component.set('v.disabled', disabled);
        if (disabledCss) {
            if(disabled){
                $A.util.addClass(component.getElement(),disabledCss);
            }else{
                $A.util.removeClass(component.getElement(), disabledCss);
            }
        }
    }

})// eslint-disable-line semi
