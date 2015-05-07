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
    testSelectWithSemicolon : {
        attributes :{
            multi:"false"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("inputSelectSemicolon");
            this.selectOptionAndVerify(inputSelectCmp, "1 ;");
            this.selectOptionAndVerify(inputSelectCmp, "2 ;;");
            this.selectOptionAndVerify(inputSelectCmp, "; 3");
            this.selectOptionAndVerify(inputSelectCmp, "4;4");
            this.selectOptionAndVerify(inputSelectCmp, "5;;");
//            this.verifyCannotSetValue(inputSelectCmp, ";;;");
        }
    },

    selectOptionAndVerify: function(inputSelectCmp, optionValue) {
        this.selectOptions(inputSelectCmp, optionValue);
        this.verifyComponentValue(inputSelectCmp, optionValue);
        this.verifyDomValue(inputSelectCmp, optionValue);
    },

    selectMultipleOptionsAndVerify: function(inputSelectCmp, options) {
        this.selectOptions(inputSelectCmp, options);
        this.verifyComponentValue(inputSelectCmp, options);
    },

    selectOptions: function(inputSelectCmp, optionValue) {
        var selectElement = inputSelectCmp.getElement();
        for(var i = 0; i < selectElement.options.length; i++) {
            var option = selectElement.options[i];
            if(optionValue.indexOf(option.value) != -1) {
                option.selected = true;
            }
        }
        // this fires the change event so that setValue is called
        $A.test.fireDomEvent(selectElement, "change");
    },

    verifyComponentValue: function(inputSelectCmp, options) {
        var componentValue = inputSelectCmp.get("v.value");
        if (options.length == 1) {
            $A.test.assertEquals(options, componentValue, "selected value was not set correctly");
        } else {
            for(var i = 0; i < options.length; i++) {
                $A.test.assertTrue(componentValue.indexOf(options[i]) != -1, "selected value was not set correctly");
            }
        }
    },

    verifyDomValue: function(inputSelectCmp, value) {
        var domValue = inputSelectCmp.getElement().value;
        $A.test.assertEquals(value, domValue, "dom value was different from the selected value");
    },

    verifyCannotSetValue: function(inputSelectCmp, value) {
        inputSelectCmp.set("v.value", value);
        this.verifyNotSelected(inputSelectCmp, value);
    },

    verifyNotSelected: function(inputSelectCmp, optionValue) {
        var componentValue = inputSelectCmp.get("v.value");
        if (componentValue) {
            $A.test.assertTrue(componentValue.indexOf(optionValue) == -1, "value was set incorrectly");
        }
    }
})