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
        	for (var j=0, lenj=updateOn.length; j < lenj; j++) {
	            if (handledEvents[updateOn[j]] !== true) {
	                this.addDomHandler(component, updateOn[j]);
	            }
        	}
            
        }
    },

    /**
     * Returns the array of lower-case event names on which this input should update its bound value object
     */
    getUpdateOn : function(component) {
    	var ret = [];
        var updateOn = component.get("v.updateOn");
        
        if(!updateOn) {
        	return ret;
    	}
        
        updateOn = updateOn.toLowerCase().split(/[\W,]+/); // split on whitespace or commas

        var domEvents = this.getDomEvents(component);
        for(var i=0, len=domEvents.length; i < len; i++){
        	for (var j=0, lenj=updateOn.length; j < lenj; j++) {
		        if(domEvents[i].toLowerCase()===updateOn[j]){
		            ret.push(updateOn[j]);
	            }
            }
        }
        
        // fall back on the default updateOn value if an invalid one is supplied
        return (ret.length > 0) ? ret : component.getDef().getAttributeDefs().getDef("updateOn").getDefault(); 
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
        component.setValue("v.value", value);
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
        this.handleUpdate(component, event);
    },
    
    /**
     * handle the value update.
     */
    handleUpdate : function(component, event) {        
        var helper = component.getDef().getHelper();
        var updateOn = helper.getUpdateOn(component);

        // if this is an event we're supposed to update on, call this component's update implementation
        if ($A.util.arrayIndexOf(updateOn, event.type) > -1) {
            helper.doUpdate(component, helper.getDomElementValue(this.getInputElement(component)));
        }
    },
    
    /**
     * Returns the input dom element in the component. If there are multiple input elements, only the first one is return.
     */
    getInputElement : function(component) {
    	var element;

    	if (component.get('v.label')) {
    		var el = component.getElement();
    		element = el.getElementsByTagName('input')[0] ||  el.getElementsByTagName('select')[0] || element;
    	} else {
    		element = component.getElement();
    	}
    	
    	return element;
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
            errorCmp.setValue("v.value", []);
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
            errorCmp.setValue("v.value", m);
        } else {
            $A.componentService.newComponentAsync(
                this,
                function(errorCmp) {
                    component.setValue("v.errorComponent", errorCmp);
                },
                {
                "componentDef": "markup://ui:inputDefaultError",
                "attributes": {
                        "values": {
                            "value" : m
                        }
                	}
            	}
            );
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
    },
    
    isEventSupported: function(eventName) {
        // create the cache
        if ($A.util.isUndefined(this.isEventSupported.cache)) {
            this.isEventSupported.cache = {};
        }

        // check the cache
        var cached = this.isEventSupported.cache[eventName];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }
        
        var el = document.createElement('input');
        var _eventName = 'on' + eventName;
        var isSupported = (_eventName in el);
        if (!isSupported) {
            el.setAttribute(_eventName, 'return;');
            isSupported = typeof el[_eventName] == 'function';
        }
        $A.util.removeElement(el); 
        return (this.isEventSupported.cache[eventName] = isSupported);
    },
    
    setAttribute: function(cmp, attr) {
        var attrs = cmp.getAttributes(),			
        concreteCmp = cmp.getConcreteComponent(),
        parentCmp = concreteCmp.getSuper();
        
        concreteCmp.getAttributes().setValue(attr.key, attr.value);
        //need to traverse up the hierarchy and set the attributes, since attribute lookup is not hierarchical once initialized
        while(parentCmp) {
        	parentCmp.getAttributes().setValue(attr.key, attr.value);
        	parentCmp = parentCmp.getSuper();
        } 
    }
})
