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

    getValueFromOptionCmps : function(cmp) {
        var opts = this.getOptionCmps(cmp);
        var selectedOptions = [];
        var optFound = false;
        for (var i = 0, len = opts.length; i < len; i++) {
            var descriptor = opts[i].getDef().getDescriptor();
            if((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOptionGroup") {
                var body = opts[i].getValue("v.body");
                if (body) {
                    for(var j = 0; j < body.getLength(); j++) {
                        var desc = body.getValue(j).getDef().getDescriptor();
                        if ((desc.getNamespace() + ":" + desc.getName()) === "ui:inputSelectOption") {
                            if (body.getValue(j).getValue("v.value").getBooleanValue() === true) {
                                var txt = body.getValue(j).get("v.text");
                                if(txt !== undefined){
                                    selectedOptions.push(txt);
                                    optFound = true;
                                }
                            }
                        }
                    }
                }
            } else if ((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOption") {
                if (opts[i].getValue("v.value").getBooleanValue() === true) {
                    var text = opts[i].get("v.text");
                    if(text !== undefined){
                        selectedOptions.push(text);
                        optFound = true;
                    }
                }
            }
        }
        return {found: optFound, optionValue: selectedOptions.join(";")};
    },

    /**
     * Updates a single option's "selected" attribute based on its value's presence in the newValues string[]
     */
    updateSingleOption: function(optionCmp, newValues) {
        var selected = false;
        var updated = false;
        if (!$A.util.isUndefinedOrNull(newValues)) {
        	if ($A.util.isArray(newValues)) {
	            for(var i=0;i<newValues.length;i++){
	                if (newValues[i] === optionCmp.get("v.text")) {
	                    selected = true;
	                    updated = true;
	                    break;
	                }
	            }
        	} else {
        		if (newValues === optionCmp.get("v.text")) {
        			selected = true;
        			updated = true;
        		}
        	}
        }
        var originalStatus = optionCmp.getValue("v.value").getBooleanValue();
        if (originalStatus !== selected) {
            optionCmp.setValue("v.value", selected);
        }
        return updated;
    },

    /**
     * Updates all options' "selected" attributes in an optionGroup
     */
    updateOptionGroup: function(optionGrpCmp, newValues) {
        var body = optionGrpCmp.getValue("v.body");
        var updated = false;
        if (body) {
            for(var i = 0; i < body.getLength(); i++) {
                var descriptor = body.getValue(i).getDef().getDescriptor();
                if ((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOption") {
                    updated = this.updateSingleOption(body.getValue(i), newValues) || updated;
                }
            }
        }
        return updated;
    },

    /**
     * Updates all options' "selected" attributes in the select element, based on the semicolon-delimited newValue string
     */
    updateOptionsFromValue: function(cmp) {
        var value = cmp.getValue("v.value");
        var selectedOptions = this.getValueFromOptionCmps(cmp);

        if (selectedOptions.found && value.getValue() === selectedOptions.optionValue) {
            return;
        }

        var newValues = cmp.get("v.value") || "";
        var isMultiple = cmp.getValue("v.multiple").getBooleanValue();
        if (isMultiple) {
        	newValues = newValues.split(";");
        } else {
        	newValues += "";
        }

        /* There are two cases here, and we handle one or the other--not both.
         * 1: options attribute is supplied--we update the state of those option objects
         * 2: inputSelectOptions are passed as v.body--we update the state of those option components
         */

        // the options attribute causes an iteration to generate a set of option components with the id "options"
        var generatedOptions = cmp.find("options");
        var optExists = false;
        if(!$A.util.isUndefinedOrNull(generatedOptions)) {
        // case 1:
            var optionsValue = cmp.getValue("v.options");
            var valIsArray = $A.util.isArray(newValues);
            cmp._suspendChangeHandlers = true;

            for (var i = 0, len = optionsValue.getLength(); i < len; i++) {
                var optionValue = optionsValue.getValue(i);
                var val = optionValue.get("value");

                if ((valIsArray && aura.util.arrayIndexOf(newValues, val) > -1) || newValues === val) {
                    optionValue.put("selected", true);
                    optExists = true;
                    // Workaround to force rerender on option. Bugged on multiselects.
                    if (!isMultiple) {
                    	optionsValue.remove(i);
                        optionsValue.insert(i, optionValue.unwrap());
                    }
                } else {
                    optionValue.put("selected", false);
                }
            }
            // Workaround to force rerender for multiselects.
            if (isMultiple) {
            	cmp.set("v.options", optionsValue.unwrap());
            }
            cmp._suspendChangeHandlers = false;
        } else {
        // case 2:
        	var body = cmp.getValue("v.body");

            if (body) {
                for(var i = 0; i < body.getLength(); i++) {
                    var descriptor = body.getValue(i).getDef().getDescriptor();
                    if((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOptionGroup") {
                        optExists = this.updateOptionGroup(body.getValue(i), newValues) || optExists;
                    } else if ((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOption") {
                    	optExists = this.updateSingleOption(body.getValue(i), newValues) || optExists;
                    }
                }
            }
        }

        if (!optExists) {
        	this.updateValueFromOptions(cmp);
        }
    },

    getOptionCmps: function(cmp) {
        var opts;

        opts = cmp.find("options");
        if($A.util.isUndefinedOrNull(opts)) {
            opts = cmp.get("v.body");
        }

        if (!$A.util.isArray(opts)) {
            opts = [opts];
        }

        return opts;
    },

    /**
     * Updates this component's "value" attribute based on the state of its options' "selected" attributes
     */
    updateValueFromOptions: function(cmp) {
        if (cmp._suspendChangeHandlers) {
        	return;
    	}

        var value = cmp.getValue("v.value");
        var selectedOptions = this.getValueFromOptionCmps(cmp);

        if (!selectedOptions.found || value.getValue() !== selectedOptions.optionValue) {

            if (!cmp.getValue("v.multiple").getBooleanValue() && selectedOptions.optionValue === "") {
                var optionCmps = this.getOptionCmps(cmp);
                if (optionCmps.length > 0) {
                    // if no options are selected, set the select's value to the first option's value
                	selectedOptions.optionValue = optionCmps[0].get("v.text");
                    optionCmps[0].set("v.selected", true);
                }
            }

            value.setValue(selectedOptions.optionValue, true);
        }
    }

})
