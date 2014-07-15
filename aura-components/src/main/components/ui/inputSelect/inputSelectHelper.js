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
     * Iterates over the options in the select element and returns a semicolon-delimited string of the selected values
     */
    getDomElementValue : function (el) {
        var selectedOptions = [];
        for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].selected) {
                selectedOptions.push(el.options[i].value);
            }
        }
        return selectedOptions.join(";");
    },
    
    /**
     * Returns a package with the array of options (as either an array of components or an array of JS objects)
     * and the strategy to work with that array
     */
    getOptionsWithStrategy: function(cmp) {
        var opts = cmp.get("v.options"),
        	strat = this.optionsStrategy;
        
        if ($A.util.isEmpty(opts)) {
        	opts = cmp.get("v.body");
        	if (!$A.util.isEmpty(opts)) {
        		strat = this.bodyStrategy;
        	} else {
        		opts = [];
        	}
        }

        return { options : opts, strategy : strat };
    },

    /**
     * Updates all options' "selected" attributes in the select element, based on the semicolon-delimited newValue string
     */
    updateOptionsFromValue: function(cmp) {
    	if (cmp._suspendChangeHandlers) {
    		return;
    	}

        var value = cmp.get("v.value"),
        	optionsPack = this.getOptionsWithStrategy(cmp),
        	selectedOptions = optionsPack.strategy.getSelected(optionsPack.options);

        if (optionsPack.options.length == 0) {
        	cmp._initOptionsFromValue = true;
        	return;
        }

        if (selectedOptions.found && value === selectedOptions.optionValue) {
            return;
        }
        
        var newValues = (cmp.get("v.value") || "").split(";");

        if (!optionsPack.strategy.updateOptions(optionsPack.options, newValues) && !($A.util.getBooleanValue(cmp.get("v.multiple")) && value == "")) {
        	this.updateValueFromOptions(cmp, optionsPack);
        } else {
        	cmp._suspendChangeHandlers = true;
        	optionsPack.strategy.persistOptions(cmp, optionsPack.options);
        	cmp._suspendChangeHandlers = false;
        }
    },

    /**
     * Updates this component's "value" attribute based on the state of its options' "selected" attributes
     */
    updateValueFromOptions: function(cmp, optionsPack) {
        if (cmp._suspendChangeHandlers) {
        	return;
    	}
        
        var value = cmp.get("v.value"),
        	isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple")),
        	optionsPack = optionsPack || this.getOptionsWithStrategy(cmp),
        	selectedOptions = optionsPack.strategy.getSelected(optionsPack.options);
        
        if (!selectedOptions.found || value !== selectedOptions.optionValue) {
        	if (!isMultiple && !selectedOptions.found) {
        		selectedOptions.optionValue = optionsPack.strategy.getValue(optionsPack.options, 0);
        		optionsPack.strategy.setOptionSelected(optionsPack.options, 0, true);
        		
        		cmp._suspendChangeHandlers = true;
            	optionsPack.strategy.persistOptions(cmp, optionsPack.options);
            	cmp._suspendChangeHandlers = false;
        	}
        	cmp.set("v.value", selectedOptions.optionValue, true);
        }
    },
    
    /**
     * Strategies for working with either an array of option objects or of body components, passed through to the
     * select component either through the "v.options" attribute or through the body in markup.
     * Abstracts the implementation away so that the logic specific to the two data structures can be separated from
     * the main component logic
     * 
     * Main functions available:
     *   updateOptions(options, newValues) - updates the list of options based on newValues, which is either an array or a string
     *   	Used for ensuring consistency between "v.value" and the list of options
     *   getValues(options) - returns a ';'-concatenated String of selected values and whether a selected value was found
     *   	Used for seeing which options are selected from the perspective of the options
     *   getText(options, index) - returns the internal text of options[index]
     *   setOptionSelected(options, index, selected) - equivalent to options[index].selected = selected
     *   persistOptions(cmp, options) - persists the array of options into the appropriate component attribute
     */
    
    /**
     * Strategy object for an array of option objects
     */
    optionsStrategy: {
    	// If an option is in newValues, we want to select it
    	updateOptions : function(options, newValues) {
    		var found = false;

    		$A.util.forEach(options, function(option) {
    			var val = option.value;
    			var selectOption = (newValues.length > 1 && aura.util.arrayIndexOf(newValues, val) > -1) || newValues[0] == val.toString();
    			
    			found = found || selectOption;
    			option.selected = selectOption;
    		}, this);
    		
    		return found;
    	},
    	// If an option is selected, we want to aggregate it into our list
    	getSelected : function(options) {
    		var values = [];
    		
    		$A.util.forEach(options, function(option) {
    			if (option.selected) {
    				values.push(option.value);
    			}
    		}, this);
    		
    		return { found : (values.length > 0), optionValue : values.join(";") };
    	},
    	getValue : function(options, index) {
    		if (!$A.util.isUndefinedOrNull(options[index])) {
    			return options[index].value;
    		}
    		return undefined;
    	},
    	setOptionSelected : function(options, index, selected) {
    		if (!$A.util.isUndefinedOrNull(options[index])) {
    			options[index].selected = selected;
    		} else {
    			// TODO: somehow expose that the option couldn't be set.
    		}
    	},
    	persistOptions : function(cmp, options) {
    		cmp.set("v.options", options);
    	}
    },
    
    /**]
     * Strategy object for an array of components (used for maintaining support for using inputSelectOption components in the body)
     */
    bodyStrategy: {
    	// Updates options based on their existence in newValues
    	updateOptions : function(options, newValues) {    		
            var result = { found : false };
            // Perform single option update function on all of our options
    		this.performOperationOnCmps(options, this.updateOption, result, newValues);
    		return result.found;
    	},
    	getSelected : function(bodyCmps) {
    		var values = [];
    		this.performOperationOnCmps(bodyCmps, this.pushIfSelected, values);
    		return { found : (values.length > 0), optionValue : values.join(";") };
    	},
    	getValue : function(options, index) {
    		if (!$A.util.isUndefinedOrNull(options[index])) {
    			return options[index].get("v.text");
    		}
    		return undefined;
    	},
    	setOptionSelected : function(options, index, selected) {
    		if (!$A.util.isUndefinedOrNull(options[index])) {
    			options[index].set("v.value", selected);
    		} else {
    			// TODO: somehow expose that the option couldn't be set.
    		}
    	},
    	persistOptions : function(cmp, options) {
    		cmp.set("v.body", options);
    	},
    	// Performs op on every ui:inputSelectOption in opts, where op = function(optionCmp, resultsObject, optionalArguments)
    	performOperationOnCmps : function(opts, op, result, newValues) {
    		$A.util.forEach(opts, function(cmp) {
        		var descriptor = cmp.getDef().getDescriptor();
        		var cmpName = descriptor.getNamespace() + ":" + descriptor.getName();
        		if (cmpName === "ui:inputSelectOptionGroup") {
        			var groupBody = cmp.get("v.body");
        			if (!$A.util.isEmpty(groupBody)) {
        				$A.util.forEach(groupBody, function(groupBodyCmp) {
        					var descriptor = groupBodyCmp.getDef().getDescriptor();
        					if ((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOption") {
        						op(groupBodyCmp, result, newValues);
        					}
        				}, this);
        			}
        		} else if (cmpName === "ui:inputSelectOption") {
    				op(cmp, result, newValues);
    			} else {
    				$A.warning("<" + cmpName + "> is currently not supported inside <ui:inputSelect> since it does not properly " +
    						   "attach the options to the component. This will lead to undefined behavior. Please " +
    						   "use 'v.options' to insert your option objects instead.");
    			}
        	}, this);
        },
        // Helper function for updateOptions
        // Update optionCmp if it exists in newValues; passes result back in result object
        updateOption : function(optionCmp, result, newValues) {
        	var text = optionCmp.get("v.text");
			var selectOption = (newValues.length > 1 && aura.util.arrayIndexOf(newValues, text) > -1) || newValues[0] === text;
			
			result.found = result.found || selectOption;
			optionCmp.set("v.value", selectOption);

        },
        // Helper function for getValues
        // Push optionCmp's value into valueList if selected
		pushIfSelected : function(optionCmp, valueList) {
			if ($A.util.getBooleanValue(optionCmp.get("v.value")) === true) {
				var text = optionCmp.get("v.text");
				if (!$A.util.isUndefined(text)) {
					valueList.push(text);
				}
			}
		}
    },
    
    /**
     * Render the options directly to the DOM for performance
     * 
     * Expected option structure:
     * {
     *     value 				: // value for the option
     *     label (optional) 	: // display text for the option. Defaults to value
     *     class (optional) 	: // CSS class for the option
     *     selected (optional) 	: // whether option should be selected
     *     disabled (optional) 	: // whether option should be disabled
     * }
     */
    renderOptions: function(cmp) {
    	var options = cmp.getConcreteComponent().get("v.options"),
			select = cmp.find("select").getElement(),
			optFrag, option, internalText;
		
		if ($A.util.isEmpty(options)) {
			return;
		}
		
    	optFrag = document.createDocumentFragment();
    	for (var i = 0; i < options.length; i++) {
    		option = document.createElement("option");
    		internalText = ($A.util.isEmpty(options[i].label) ? options[i].value : options[i].label) || "";
    		
    		option.label = options[i].label || internalText;
    		
    		if (!$A.util.isUndefined(options[i].value)) {
    			option.value = options[i].value;
    		} else {
    			$A.warning("Option at index " + i + " in select component " + cmp.getGlobalId() + " has an undefined value.");
    		}
    		
    		if (options[i]["class"]) {
    			option.setAttribute("class", options[i]["class"]);
    		}

    		if (options[i].selected) {
    			option.selected = "selected";
    		}
    		
    		if (options[i].disabled) {
    			option.disabled = "disabled";
    		}
    		
    		option.appendChild(document.createTextNode(internalText));
    		
    		optFrag.appendChild(option);
    	}
    	
    	while (select.firstChild) {
    		select.removeChild(select.firstChild);
    	}
    	select.appendChild(optFrag);
    }
    
})