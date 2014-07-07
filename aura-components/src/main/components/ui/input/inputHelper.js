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
	 * @Override
	 */
	addDomHandler : function(component, event) {
        var el = this.getInputElement(component);
        $A.util.on(el, event, this.domEventHandler);
	},

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
        component.set("v.value", value);
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

    	if (this.hasLabel(component)) {
    		var el = component.getElement();
    		element = el.getElementsByTagName('input')[0] ||  el.getElementsByTagName('select')[0] ||  el.getElementsByTagName('textarea')[0] || el;
    	} else {
    		element = component.getElement();
    	}

    	return element;
    },

    /**
     * Set a default error component.
     */
    setErrorComponent : function(component, value) {
        if (value.isValid()) {
            this.validate(component);
        } else {
            this.invalidate(component, value);
        }
    },

    /**
     * Dismiss the error messages and restore the component to the normal state.
     */
    validate : function(component) {
        var errorCmp = component.get("v.errorComponent")[0];

        // Mark as not invalid
        component._invalidValue = false;

        // Remove errors
        if (errorCmp && errorCmp.get("v.value.length") > 0) {
            errorCmp.set("v.value", []);
        }
    },

    /**
     * Show up the the error messages and put the component in the error state.
     */
    invalidate : function(component, value) {
        var m = [];
        var valueErr = value.getErrors();

        // Mark as invalid
        component._invalidValue = true;

        for (var i = 0; i < valueErr.length; i++) {
            m.push(valueErr[i].message);
        }
        // Update error component
        var errorCmp = component.get("v.errorComponent")[0];
        if (errorCmp) {
            errorCmp.set("v.value", m);
        } else {
            component._creatingAsyncErrorCmp = true;
            $A.componentService.newComponentAsync(
                this,
                function(errorCmp) {
                	var ariaDesc = component.get("v.ariaDescribedby");
                    ariaDesc = this.addTokenToString(ariaDesc, errorCmp.getGlobalId());
                	component.set("v.errorComponent", errorCmp);
                	this.setAttribute(component, {key: "ariaDescribedby", value: ariaDesc});
                	component._creatingAsyncErrorCmp = false;
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
    
    updateErrorElement : function(component) {
    	var inputEl = this.getInputElement(component);
    	var classFunc = component._invalidValue ? $A.util.addClass : $A.util.removeClass;
    	
    	classFunc.apply($A.util, [inputEl, "inputError"]);
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
        concreteCmp = cmp.getConcreteComponent(),
        parentCmp = concreteCmp.getSuper();

        concreteCmp.set("v." + attr.key, attr.value);
        //need to traverse up the hierarchy and set the attributes, since attribute lookup is not hierarchical once initialized
        while(parentCmp) {
        	parentCmp.set("v." + attr.key, attr.value);
        	parentCmp = parentCmp.getSuper();
        }
    },

    // Can str ever be null/undef?
    addTokenToString: function(str, token) {
    	token = $A.util.trim(token);
    	str = $A.util.trim(str);
    	if (str) {
    		if ((' ' + str + ' ').indexOf(' ' + token + ' ') == -1) {
    			str += ' ' + token;
    		}
    	} else {
    		str = token;
    	}
    	return str
    },

    addInputClass: function(cmp) {
    	if (this.hasLabel(cmp)) {
    		var inputEl = this.getInputElement(cmp);
    		$A.util.addClass(inputEl, cmp.getConcreteComponent().getDef().getStyleClassName());
    	}
    },

    hasLabel: function(cmp) {
    	var label = cmp.get('v.label');
    	return !!(label && label.length > 0);
    },

    formatValue: function(cmp) {
        return cmp.get("v.value");
    }
})
