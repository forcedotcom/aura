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
     * Adds an event handler for input specific DOM event for which this input has a Aura-equivalent handler
     */
    addInputDomEvents : function(component) {
    	var events = ["input", "change", "paste", "copy", "cut"];
    	
    	for (var i=0, len=events.length; i < len; i++) {
            if (component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }    		
    	}

        var updateOn = this.getUpdateOn(component);
        if (updateOn) {
            var handledEvents = this.getHandledDOMEvents(component);
            if (handledEvents[updateOn] !== true) {
                this.addDomHandler(component, updateOn);
            }
        }
    },

    /**
     * Returns the lower-case event name on which this input should update its bound value object
     */
    getUpdateOn : function(component){
        var updateOn = component.get("v.updateOn");
        if(!updateOn) return;
        updateOn = updateOn.toLowerCase();

        var domEvents = this.getDomEvents(component);
        for(var i=0,len=domEvents.length; i<len; i++){
            if(domEvents[i].toLowerCase()===updateOn){
                return updateOn;
            }
        }
        // fall back on the default updateOn value if an invalid one is supplied
        return component.getDef().getAttributeDefs().getDef("updateOn").getDefault();
    },

    /**
     * Obtains the current value from the DOM element.  May be overridden by extensions.
     */
    getDomElementValue : function (element) {
        return element.value;
    },

    /**
     * Update this component's bound value object.
     *
     * This hook allows extensions of ui:input to augment or override update behaviour
     */
    doUpdate : function(component, value) {
        component.setValue("{!v.value}", value);
    },

    /**
     * Display the validation error if there is any.
     *
     */
    handleErrors : function(component) {
        var concreteCmp = component.getConcreteComponent();
        var value = concreteCmp.getValue("v.value");
        if (value) {
            if (!component.hasEventHandler("onError")) { // no onError event handler attached, use default error component
                this.setErrorComponent(component, value);
            }
        }
    },

    /**
     * Pre-process the event before we fire it.
     */
    preEventFiring : function(component, event) {
        var element = component.getElement();
        var helper = component.getDef().getHelper();
        var updateOn = helper.getUpdateOn(component);

        // if this is the event we're supposed to update on, call this component's update implementation
        if (event.type === updateOn) {
            helper.doUpdate(component, helper.getDomElementValue(element));
        }
    },

    /**
     * Set a default error component.
     */
    setErrorComponent : function(component, value) {
        var element = component.getElement();
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        var valueProvider = htmlCmp.getAttributes().getComponentValueProvider();
        if (value.isValid()) {
            this.validate(component, valueProvider);
        } else {
            this.invalidate(component, valueProvider, value);
        }
    },

    /**
     * Dismiss the error messages and restore the component to the normal state.
     */
    validate : function(component, valueProvider) {
        valueProvider.removeClass("inputError");
        var errorCmp = component.get("v.errorComponent")[0];
        if (errorCmp && errorCmp.getValue("v.value.length").getValue() > 0) {
            errorCmp.setValue("{!v.value}", []);
        }
    },

    /**
     * Show up the the error messages and put the component in the error state.
     */
    invalidate : function(component, valueProvider, value) {
        valueProvider.addClass("inputError");
        var m = [];
        var valueErr = value.getErrors();
        for (var i = 0; i < valueErr.length; i++) {
            m.push(valueErr[i].message);
        }
        var errorCmp = component.get("v.errorComponent")[0];
        if (errorCmp && !errorCmp.getValue("v.value").compare(m)) {
            errorCmp.setValue("{!v.value}", m);
        } else {
            errorCmp = $A.componentService.newComponent({
                "componentDef": "markup://ui:inputDefaultError",
                "attributes": {
                    "values": {
                        "value" : m
                    }
                }
            });
            component.setValue("{!v.errorComponent}", errorCmp);
        }
    },

    /**
     * Returns true if the browser supports HTML5 inputs of specified type, false otherwise
     *
     * Caches results to avoid recomputation.
     */
    isHTML5Input : function(type) {
        // create the cache
        if ($A.util.isUndefined(this.isHTML5Input.cache)) {
            this.isHTML5Input.cache = {};
        }

        // check the cache
        var cached = this.isHTML5Input.cache[type];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        // fill the cache by checking if an new input of "type" comes out with that type
        var test = document.createElement("input");
        test.setAttribute("type", type);
        return (this.isHTML5Input.cache[type] = (test.type === type));
    }
})
