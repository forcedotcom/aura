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

    init: function(cmp) {
        var currentValue = cmp.get("v.value");

        if ($A.util.isEmpty(cmp.get("v.options")) && !$A.util.isEmpty(cmp.get("v.body"))) {
            cmp.set("v.renderBody", true);
        }

        if (!$A.util.isUndefined(currentValue)) {
            // if a "value" attribute is specified on initial render, it should win over what the individual options report
            this.updateOptionsFromValue(cmp);
        } else {
            // otherwise update the "value" attribute based on the options that claim to be selected
            this.updateValueFromOptions(cmp);
        }
    },

    updateMenuListWidth: function(cmp) {
        var menuListElement = cmp.find("options").getElement();
        if (menuListElement) {
            var triggerRect = cmp.find("selectTrigger").getElement().getBoundingClientRect();
            var width = typeof triggerRect.width !== 'undefined' ? triggerRect.width : triggerRect.right - triggerRect.left;
            if (width > 0) {
                menuListElement.style.width = width + "px";
                var minWidth = 200;
                // In case the width exceeds the max width we want to still limit to the width of the trigger,
                // unless it's smaller than minWidth
                menuListElement.style.maxWidth = Math.max(minWidth, width) + "px";
                menuListElement.style.minWidth = minWidth + "px";
            }
        }
    },

    /**
     * Iterates over the options in the select element and returns a semicolon-delimited string of the selected values
     */
    getDomElementValue: function(el) {
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
    getOptionsWithStrategy: function(cmp) {
        var strat = this.optionsStrategy,
            opts = strat.getOptions(cmp);

        if ($A.util.isEmpty(opts)) {
            strat = this.bodyStrategy;
            opts = strat.getOptions(cmp);
        }

        return {options: opts, strategy: strat};
    },

    menuOptionSelected: function(cmp) {
        var menuItems = cmp.find("options").get("v.body");

        var buildAListOfSelectedOptions = function(accumulator, menuItem) {
            if (menuItem.get("v.selected")) {
                accumulator.push({label: menuItem.get("v.label"), value: menuItem.get("v.value")});
            }
            return accumulator;
        };
        var selectedOptions = menuItems.reduce(buildAListOfSelectedOptions, []);

        var newSelectedLabel = selectedOptions.map(function(value) { return value.label; }).join(this.optionSeparator);
        var newValue = selectedOptions.map(function(value) { return value.value; }).join(this.optionSeparator);

        if (cmp.get("v.selectedLabel") === newSelectedLabel) {
            return;
        }

        cmp.set("v.selectedLabel", newSelectedLabel);
        cmp._suspendChangeHandlers = true;
        cmp.set("v.value", newValue);
        cmp.get("e.change").fire();
        cmp._suspendChangeHandlers = false;
    },

    createMenuItems: function(cmp) {
        var options = cmp.get("v.options");
        var menuItems = [];

        var handleCreatedMenuItem = function(menuItem, status) {
        	if (status === "SUCCESS") {
        		menuItems.push(menuItem);
                if (menuItems.length === options.length) {
                    cmp.find("options").set("v.body", menuItems);
                }
        	}
        };
        var multiSelect = cmp.get("v.multiple");
        var menuItemComponentName = multiSelect ? "ui:checkboxMenuItem" : "ui:radioMenuItem";

        $A.getDefinition(menuItemComponentName, function() {
            for (var i = 0; i < options.length; i++) {
                $A.createComponent(menuItemComponentName, {
                    "label": options[i].label,
                    "value": options[i].value,
                    "selected": $A.util.getBooleanValue(options[i].selected),
                    "hideMenuAfterSelected": !multiSelect
                }, handleCreatedMenuItem);
            }
        });
    },

    updateMenuLabel: function(cmp) {
        var options = cmp.get("v.options");

        var newLabel = options.filter(function(option) { return option.selected; })
            .map(function(option) { return option.label; })
            .join(this.optionSeparator);

        // If nothing was selected, just default the label to the first item
        if (newLabel === "" && options[0]) {
            newLabel = options[0].label;
        }

        cmp.set("v.selectedLabel", newLabel);
    },

    /**
     * Updates all options' "selected" attributes in the select element, based on the semicolon-delimited newValue string
     */
    updateOptionsFromValue: function(cmp, createNewOptions) {
        if (cmp._suspendChangeHandlers) {
            return;
        }

        var value = cmp.get("v.value"),
            optionsPack = this.getOptionsWithStrategy(cmp),
            selectedOptions = optionsPack.strategy.getSelected(optionsPack.options);

        if (optionsPack.options.length === 0) {
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

        if (!optionsPack.strategy.updateOptions(cmp, optionsPack.options, newValues, createNewOptions) && !(isMultiple && value === "")) {
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
    updateValueFromOptions: function(cmp, optionsPack) {
        if (cmp._suspendChangeHandlers) {
            return;
        }
        optionsPack = optionsPack || this.getOptionsWithStrategy(cmp);

        var value = cmp.get("v.value"),
            isMultiple = $A.util.getBooleanValue(cmp.get("v.multiple")),
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
        getOptions: function(cmp) {
            return cmp.get("v.options");
        },

        // If an option is in newValues, we want to select it
        updateOptions: function(cmp, options, newValues, createNewOptions) {
            var found = false;
            var i;

            for (i = 0; i < options.length; i++) {
                var option = options[i];
                var val = option.value;
                if ($A.util.isUndefinedOrNull(val)) {
                	continue;
                }
                var selectOption = (newValues.length > 1 && newValues.indexOf(val) > -1) || newValues[0] === val.toString();

                found = found || selectOption;
                option.selected = selectOption;
            }

            if (!found && createNewOptions) {
                for (i=0; i<newValues.length; i++) {
                    options.unshift({
                        label: newValues[i],
                        value: newValues[i],
                        selected: true
                    });
                }
            }

            return found;
        },
        // If an option is selected, we want to aggregate it into our list
        getSelected: function(options) {
            var values = [];

            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                if (option.selected) {
                    values.push(option.value || "");
                }
            }

            return values;
        },
        getValue: function(options, index) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                return options[index].value;
            }
            return undefined;
        },
        setOptionSelected: function(options, index, selected) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                options[index].selected = selected;
            // } else {
                // TODO: somehow expose that the option couldn't be set.
            }
        },
        persistOptions: function(cmp, options) {
            cmp.set("v.options", options);
        }
    },

    /**]
     * Strategy object for an array of components (used for maintaining support for using inputSelectOption components in the body)
     */
    bodyStrategy: {
        SUPPORTEDCONTAINERS: ["ui:inputSelectOptionGroup", "aura:iteration", "aura:if", "aura:renderIf"],

        getOptions: function(cmp) {
            var options = [];
            this.performOperationOnCmps(cmp.get("v.body"), this.addOptionToList, options);
            return options;
        },
        // Updates options based on their existence in newValues
        updateOptions: function(cmp, options, newValues) {
            var result = {found: false};
            // Perform single option update function on all of our options
            this.performOperationOnCmps(options, this.updateOption, result, newValues);
            return result.found;
        },
        getSelected: function(bodyCmps) {
            var values = [];
            this.performOperationOnCmps(bodyCmps, this.pushIfSelected, values);
            return values;
        },
        getValue: function(options, index) {
            if (options[index]) {
                return options[index].get("v.text");
            }
            return undefined;
        },
        setOptionSelected: function(options, index, selected) {
            if (!$A.util.isUndefinedOrNull(options[index])) {
                options[index].set("v.value", selected);
            // } else {
                // TODO: somehow expose that the option couldn't be set.
            }
        },
        persistOptions: function() {
            // v.body should remain the same in case iteration options change. See W-2926861
            //cmp.set("v.body", options);
        },
        // Performs op on every ui:inputSelectOption in opts, where op = function(optionCmp, resultsObject, optionalArguments)
        performOperationOnCmps: function(opts, op, result, newValues) {
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
                    var cmpName = cmp.getName();
                    $A.warning("<" + cmpName + "> is currently not supported inside <ui:inputSelect> since it does not properly " +
                    "attach the options to the component. This will lead to undefined behavior. Please " +
                    "use 'v.options' to insert your option objects instead.");
                }
            }
        },
        // Helper function for updateOptions
        // Update optionCmp if it exists in newValues; passes result back in result object
        updateOption: function(optionCmp, result, newValues) {
            var text = optionCmp.get("v.text");
            var selectOption = (newValues.length > 1 && newValues.indexOf(text) > -1) || newValues[0] === text;

            result.found = result.found || selectOption;
            optionCmp.set("v.value", selectOption);

        },
        // Helper function for getValues
        // Push optionCmp's value into valueList if selected
        pushIfSelected: function(optionCmp, valueList) {
            if ($A.util.getBooleanValue(optionCmp.get("v.value")) === true) {
                var text = optionCmp.get("v.text");
                if (!$A.util.isUndefined(text)) {
                    valueList.push(text);
                }
            }
        },
        addOptionToList: function(cmp, list) {
            list.push(cmp);
        },
        canSupportOptions: function(cmp) {
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
        try {
            if (optionElement.label !== option.label || optionElement.label !== internalText) {
                optionElement.label = option.label || internalText;
            }
        } catch (e) {
            //IE9,10,11 is complaining because we're reading "label" attribute before writing to it
            optionElement.label = option.label || internalText;
        }

    	// Check/update value
    	if (optionElement.value !== option.value) {
    		optionElement.value = option.value;
    		if ($A.util.isUndefined(option.value)) {
    			$A.warning("Option with label '" + option.label + "' in select component " + cmp.getGlobalId() + " has an undefined value.");
    		}
    	}

    	// Check/update class
        var optionClass = option["class"];
    	if (!$A.util.isEmpty(optionClass) && optionElement.getAttribute("class") !== optionClass) {
    		optionElement.setAttribute("class", optionClass);
    	}

    	// Check/update selected
    	if (optionElement.selected !== option.selected) {
	    	optionElement.selected = option.selected ? "selected" : undefined;
	    }

    	// Check/update disabled
    	if (optionElement.disabled !== option.disabled) {
	    	optionElement.disabled = option.disabled ? "disabled" : undefined;
	    }

    	// Check/update internalText
    	if (optionElement.textContent !== internalText) {
    		$A.util.setText(optionElement, internalText);
    	}

    	return optionElement;
    },

    getInternalText: function(option) {
    	return ($A.util.isEmpty(option.label) ? option.value : option.label) || '';
    }

})// eslint-disable-line semi
