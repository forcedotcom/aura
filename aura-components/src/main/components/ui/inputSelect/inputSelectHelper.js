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
                    }
                }
            }
        }
        return selectedOptions.join(";");
    },

    /**
     * Updates a single option's "selected" attribute based on its value's presence in the newValues string[]
     */
    updateSingleOption: function(optionCmp, newValues) {
        var selected = false;
        if (!$A.util.isUndefinedOrNull(newValues)) { 
        	if ($A.util.isArray(newValues)) {
	            for(var i=0;i<newValues.length;i++){
	                if (newValues[i] === optionCmp.get("v.text")) {
	                    selected = true;
	                    break;
	                }
	            }
        	} else {
        		if (newValues === optionCmp.get("v.text")) {
        			selected = true;
        		}
        	}
        }
        var originalStatus = optionCmp.getValue("v.value").getBooleanValue();
        if (originalStatus !== selected) {
            optionCmp.setValue("v.value", selected);
        }
    },

    /**
     * Updates all options' "selected" attributes in an optionGroup
     */
    updateOptionGroup: function(optionGrpCmp, newValues) {
        var body = optionGrpCmp.getValue("v.body");
        if (body) {
            for(var i = 0; i < body.getLength(); i++) {
                var descriptor = body.getValue(i).getDef().getDescriptor();
                if ((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOption") {
                    this.updateSingleOption(body.getValue(i), newValues);
                }
            }
        }
    },

    /**
     * Updates all options' "selected" attributes in the select element, based on the semicolon-delimited newValue string
     */
    updateOptionsFromValue: function(cmp) {
        var value = cmp.getValue("v.value");
        var optionValue = this.getValueFromOptionCmps(cmp);
        
        if (value.getValue() === optionValue) {
            return;
        }

        var newValues = cmp.get("v.value") || "";
        
        if (cmp.get("v.multiple")) {
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
                } else {
                    optionValue.put("selected", false);
                }
            }

            cmp._suspendChangeHandlers = false;
        } else {
        // case 2:
        	var body = cmp.getValue("v.body");
        	
            if (body) {
                for(var i = 0; i < body.getLength(); i++) {
                    var descriptor = body.getValue(i).getDef().getDescriptor();
                    if((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOptionGroup") {
                        this.updateOptionGroup(body.getValue(i), newValues);
                    } else if ((descriptor.getNamespace() + ":" + descriptor.getName()) === "ui:inputSelectOption") {
                        this.updateSingleOption(body.getValue(i), newValues);
                    }
                }
            }
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
        var optionValue = this.getValueFromOptionCmps(cmp);

        if (value.getValue() !== optionValue) {

            if (!cmp.getValue("v.multiple").getBooleanValue() && optionValue === "") {
                var optionCmps = this.getOptionCmps(cmp);
                if (optionCmps.length > 0) {
                    // if no options are selected, set the select's value to the first option's value
                    optionValue = optionCmps[0].get("v.text");
                    optionCmps[0].getValue("v.selected").setValue(true);
                }
            }

            value.setValue(optionValue, true);
        }
    }

})
