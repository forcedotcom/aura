/*
 * Copyright (C) 2012 salesforce.com, inc.
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
        for (var event in events) {
            this.addDomHandler(component, event);
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

        // extended components can do some event processing before the Aura event gets fired
        helper.preEventFiring(component, event);

        // fire the equivalent Aura event
        helper.fireEvent(component, event);
    },
    
    /**
     * Fire the equivalent Aura event for DOM one.
     * This can be overridden by extended component
     */
     fireEvent : function (component, event) {
        var e = component.getEvent(event.type);
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
    }
})
