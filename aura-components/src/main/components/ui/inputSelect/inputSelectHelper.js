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
    optionSeparator: ";",

    init: function (cmp) {
        var currentValue = cmp.get("v.value");

        if (!$A.util.isUndefined(currentValue)) {
            // if a "value" attribute is specified on initial render, it should win over what the individual options report
            this.updateOptionsFromValue(cmp);
        } else {
            // otherwise update the "value" attribute based on the options that claim to be selected
            this.updateValueFromOptions(cmp);
        }
    },

    /**
     * Iterates over the options in the select element and returns a semicolon-delimited string of the selected values
     */
    getDomElementValue: function (el) {
        var selectedOptions = [];
        for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].selected) {
                selectedOptions.push(el.options[i].value);
            }
        }
        return selectedOptions.join(this.optionSeparator);
    },

    /**
     * Returns a package with the array of options (as either an array of components or an array of JS objects)
     * and the strategy to work with that array
     */
    getOptionsWithStrategy: function (cmp) {
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

        return {options: opts, strategy: strat};
    },

    /**
     * Updates all options' "selected" attributes in the select element, based on the semicolon-delimited newValue string
     */
    updateOptionsFromValue: function (cmp) {
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


        if (this.isAlreadySelected(cmp, selectedOptions)) {
            return;
        }

        var valueOrEmpty = cmp.get("v.value") || "";
        var newValues;

        var isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple"));
        if (isMultiple) {
            // This breaks if the option itself contains the separator
            newValues = valueOrEmpty.split(this.optionSeparator);
        } else {
            newValues = [valueOrEmpty];
        }

        if (!optionsPack.strategy.updateOptions(cmp, optionsPack.options, newValues) && !(isMultiple && value == "")) {
            this.updateValueFromOptions(cmp, optionsPack);
        } else {
            cmp._suspendChangeHandlers = true;
            optionsPack.strategy.persistOptions(cmp, optionsPack.options);
            cmp._suspendChangeHandlers = false;
        }
    },

    isAlreadySelected: function(cmp, selectedOptions) {
        var value = cmp.get("v.value");
        var isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple"));

        return selectedOptions.length > 0 &&
            (isMultiple && value === selectedOptions.join(this.optionSeparator)) ||
            (!isMultiple && value === selectedOptions[0]);
    },

    /**
     * Updates this component's "value" attribute based on the state of its options' "selected" attributes
     */
    updateValueFromOptions: function (cmp, optionsPack) {
        if (cmp._suspendChangeHandlers) {
            return;
        }

        var value = cmp.get("v.value"),
            isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple")),
            optionsPack = optionsPack || this.getOptionsWithStrategy(cmp),
            selectedOptions = optionsPack.strategy.getSelected(optionsPack.options);
        var optionValue = selectedOptions.join(this.optionSeparator);
        if (selectedOptions.length === 0 || value !== optionValue) {
            if (!isMultiple && selectedOptions.length === 0) {
                optionValue = optionsPack.strategy.getValue(optionsPack.options, 0);
                optionsPack.strategy.setOptionSelected(optionsPack.options, 0, true);

                cmp._suspendChangeHandlers = true;
                optionsPack.strategy.persistOptions(cmp, optionsPack.options);
                cmp._suspendChangeHandlers = false;
            }
            cmp.set("v.value", optionValue, true);
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
     *    Used for ensuring consistency between "v.value" and the list of options
     *   getValues(options) - returns a ';'-concatenated String of selected values and whether a selected value was found
     *    Used for seeing which options are selected from the perspective of the options
     *   getText(options, index) - returns the internal text of options[index]
     *   setOptionSelected(options, index, selected) - equivalent to options[index].selected = selected
     *   persistOptions(cmp, options) - persists the array of options into the appropriate component attribute
     */

    /**
     * Strategy object for an array of option objects
     */
    optionsStrategy: {

        // If an option is in newValues, we want to select it
        updateOptions: function (cmp, options, newValues) {
            var found = false;

            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                var val = option.value;
                if ($A.util.isUndefinedOrNull(val)) {
                	continue;
                }
                var selectOption = (newValues.length > 1 && newValues.indexOf(val) > -1) || newValues[0] == val.toString();

                found = found || selectOption;
                option.selected = selectOption;
            }

            return found;
        },
        // If an option is selected, we want to aggregate it into our list
        getSelected: function (options) {
            var values = [];

            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                if (option.selected) {
                    values.push(option.value || "");
                }
            }

            return values;
        },
        getValue: function (options, index) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                return options[index].value;
            }
            return undefined;
        },
        setOptionSelected: function (options, index, selected) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                options[index].selected = selected;
            } else {
                // TODO: somehow expose that the option couldn't be set.
            }
        },
        persistOptions: function (cmp, options) {
            cmp.set("v.options", options);
        }
    },

    /**]
     * Strategy object for an array of components (used for maintaining support for using inputSelectOption components in the body)
     */
    bodyStrategy: {
        SUPPORTEDCONTAINERS: ["ui:inputSelectOptionGroup", "aura:iteration", "aura:if", "aura:renderIf"],

        // Updates options based on their existence in newValues
        updateOptions: function (cmp, options, newValues) {
            var result = {found: false};
            // Perform single option update function on all of our options
            this.performOperationOnCmps(options, this.updateOption, result, newValues);
            return result.found;
        },
        getSelected: function (bodyCmps) {
            var values = [];
            this.performOperationOnCmps(bodyCmps, this.pushIfSelected, values);
            return values;
        },
        getValue: function (options, index) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                return options[index].get("v.text");
            }
            return undefined;
        },
        setOptionSelected: function (options, index, selected) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                options[index].set("v.value", selected);
            } else {
                // TODO: somehow expose that the option couldn't be set.
            }
        },
        persistOptions: function (cmp, options) {
            cmp.set("v.body", options);
        },
        // Performs op on every ui:inputSelectOption in opts, where op = function(optionCmp, resultsObject, optionalArguments)
        performOperationOnCmps: function (opts, op, result, newValues) {
            for (var i = 0; i < opts.length; i++) {
                var cmp = opts[i];
                if (cmp.isInstanceOf("ui:inputSelectOption")) {
                    op(cmp, result, newValues);
                } else if (this.canSupportOptions(cmp)) {
                    var groupBody = cmp.get("v.body");
                    if (!$A.util.isEmpty(groupBody)) {
                        this.performOperationOnCmps(groupBody, op, result, newValues);
                    }
                } else {
                    var descriptor = cmp.getDef().getDescriptor();
                    var cmpName = descriptor.getNamespace() + ":" + descriptor.getName();
                    $A.warning("<" + cmpName + "> is currently not supported inside <ui:inputSelect> since it does not properly " +
                    "attach the options to the component. This will lead to undefined behavior. Please " +
                    "use 'v.options' to insert your option objects instead.");
                }
            }
        },
        // Helper function for updateOptions
        // Update optionCmp if it exists in newValues; passes result back in result object
        updateOption: function (optionCmp, result, newValues) {
            var text = optionCmp.get("v.text");
            var selectOption = (newValues.length > 1 && newValues.indexOf(text) > -1) || newValues[0] === text;

            result.found = result.found || selectOption;
            optionCmp.set("v.value", selectOption);

        },
        // Helper function for getValues
        // Push optionCmp's value into valueList if selected
        pushIfSelected: function (optionCmp, valueList) {
            if ($A.util.getBooleanValue(optionCmp.get("v.value")) === true) {
                var text = optionCmp.get("v.text");
                if (!$A.util.isUndefined(text)) {
                    valueList.push(text);
                }
            }
        },
        canSupportOptions: function (cmp) {
            for (var i = 0; i < this.SUPPORTEDCONTAINERS.length; i++) {
                if (cmp.isInstanceOf(this.SUPPORTEDCONTAINERS[i])) {
                    return true;
                }
            }
            return false;
        }
    },

    /**
     * Render the option elements from the provided option objects
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
    renderOptions: function(cmp, options) {
    	var fragment = document.createDocumentFragment();
    	
    	for (var i = 0; i < options.length; ++i) {
    		var optionElement = document.createElement('option');
            fragment.appendChild(this.updateOptionElement(cmp, options[i], optionElement));
    	}
    	
    	return fragment;
    },
    
    updateOptionElement: function(cmp, option, optionElement) {
    	var internalText = this.getInternalText(option);
    	// Check/update label
    	//IE9,10,11 is complaining because we're reading "label" attribute before writing to it
    	var isIEBrowser = $A.get("$Browser").isIE11 || $A.get("$Browser").isIE10 || $A.get("$Browser").isIE9;
    	if (isIEBrowser) { 
    		optionElement.label = option.label || internalText; 
    	}// End IE11 workaround 
    	else if (optionElement.label != option.label || optionElement.label != internalText) {
    		optionElement.label = option.label || internalText;
    	}
    	
    	// Check/update value
    	if (optionElement.value != option.value) {
    		optionElement.value = option.value;
    		if ($A.util.isUndefined(option.value)) {
    			$A.warning("Option with label '" + option.label + "' in select component " + cmp.getGlobalId() + " has an undefined value.");
    		}
    	}
    	
    	// Check/update class
    	if (optionElement.getAttribute("class") != option["class"]) {
    		optionElement.setAttribute("class", option["class"]);
    	}
    	
    	// Check/update selected
    	if (optionElement.selected != option.selected) {
	    	optionElement.selected = option.selected ? "selected" : undefined;
	    }
    	
    	// Check/update disabled
    	if (optionElement.disabled != option.disabled) {
	    	optionElement.disabled = option.disabled ? "disabled" : undefined;
	    }
    	
    	// Check/update internalText
    	if (optionElement.textContent != internalText) {
    		$A.util.setText(optionElement, internalText);
    	}
    	
    	return optionElement
    },
    
    getInternalText: function(option) {
    	return ($A.util.isEmpty(option.label) ? option.value : option.label) || '';
    }

})