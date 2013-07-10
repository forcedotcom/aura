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
     * Adds an event handler for every DOM event for which this input has a Aura-equivalent handler
     */
    addDomEvents : function(component) {    	
        var events = this.getHandledDOMEvents(component);
        //work around for bug W-1744442
        var helper = component.getConcreteComponent().getDef().getHelper() || this;
        for (var event in events) {
            helper.addDomHandler(component, event);
        }
    },

    /**
     * Adds an event handler for the given DOM event
     */
    addDomHandler : function(component, event) {
        var el = component.getElement();
        $A.util.on(el, event, this.domEventHandler);
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
        var element = event.target;
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        var component = htmlCmp.getAttributes().getComponentValueProvider().getConcreteComponent();
        var helper = component.getDef().getHelper();
        
        if (!helper) {
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
    },

    /**
     * Fire the equivalent Aura event for DOM one.
     * This can be overridden by extended component
     */
     fireEvent : function (component, event, helper) {
        var e = component.getEvent(event.type);
        helper.setEventParams(e, event);
        e.fire();
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
    preEventFiring : function(component, event){
    },

    /**
     * Set event's parameters with the value from DOM event.
     * The event's parameter name should be the same as the property name in DOM event.
     */
    setEventParams : function(e, DOMEvent) {
        // set parameters if there is any
        var attributeDefs = e.getDef().getAttributeDefs();
        var params = {};
        for (var key in attributeDefs) {
            if (key === "domEvent") {
                params[key] = DOMEvent;
            } else if (key === "keyCode") { // we need to re-visit this keyCode madness soon
                params[key] = DOMEvent.which || DOMEvent.keyCode;
            } else {
                params[key] = DOMEvent[key];
            }
        };
        e.setParams(params);
    },

    /**
     * Toggle a component's disabled state and an optional CSS class.
     * @param {Component} component The component being toggled.
     * @param {Boolean} disabled True to set disabled; false for enabled.
     * @param {String} disabledCss Optional css class to apply when disabled, and remove when enabled.
     */
    setDisabled: function(component, disabled, disabledCss) {
        component.setValue('v.disabled', disabled);
        if (disabledCss) {
            var fn = disabled ? component.addClass : component.removeClass;
            fn.call(component, disabledCss);
        }
    }

})
