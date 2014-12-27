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
    testSelectInIteration : {
        attributes :{
            multi:"false"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectIteration");
            this.selectOptionAndVerify(inputSelectCmp, "Montreal");
            this.selectOptionAndVerify(inputSelectCmp, "Toronto");
            this.selectOptionAndVerify(inputSelectCmp, "Quebec");
            this.verifyCannotSetValue(inputSelectCmp, "Calgary")
        }
    },

    testMultiSelectInIteration : {
        attributes :{
            multi:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectIteration");
            this.selectMultipleOptionsAndVerify(inputSelectCmp, ["Montreal", "Toronto", "Quebec"]);

            this.selectOptions(inputSelectCmp, ["Quebec", "Toronto", "Calgary"]);
            this.verifyComponentValue(inputSelectCmp, ["Quebec", "Toronto"])
            this.verifyNotSelected(inputSelectCmp, "Calgary");

            this.selectOptions(inputSelectCmp, ["Edmonton", "Calgary"]);
            this.verifyNotSelected(inputSelectCmp, "Edmonton");
            this.verifyNotSelected(inputSelectCmp, "Calgary");
        }
    },

    testSelectInIf : {
        attributes :{
            multi:"false",
            condition:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectCondition");
            this.selectOptionAndVerify(inputSelectCmp, "Toronto");
            this.selectOptionAndVerify(inputSelectCmp, "Quebec");
            this.verifyCannotSetValue(inputSelectCmp, "Montreal");
        }
    },

    testMultiSelectInIf : {
        attributes :{
            multi:"true",
            condition:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectCondition");
            this.selectMultipleOptionsAndVerify(inputSelectCmp, [ "Toronto", "Quebec"]);

            this.selectOptions(inputSelectCmp, ["Montreal", "Quebec"]);
            this.verifyComponentValue(inputSelectCmp, "Quebec")
            this.verifyNotSelected(inputSelectCmp, "Montreal");
        }
    },

    testSelectInElse : {
        attributes :{
            multi:"false",
            condition:"false"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectCondition");
            this.selectOptionAndVerify(inputSelectCmp, "Montreal");
            this.selectOptionAndVerify(inputSelectCmp, "Quebec");
            this.verifyCannotSetValue(inputSelectCmp, "Toronto");
        }
    },

    testMultiSelectInElse : {
        attributes :{
            multi:"true",
            condition:"false"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectCondition");
            this.selectMultipleOptionsAndVerify(inputSelectCmp, [ "Montreal", "Quebec"]);

            this.selectOptions(inputSelectCmp, ["Toronto", "Quebec"]);
            this.verifyComponentValue(inputSelectCmp, "Quebec")
            this.verifyNotSelected(inputSelectCmp, "Toronto");
        }
    },

    testSelectInRenderIf : {
        attributes :{
            multi:"false",
            condition:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectRenderIf");
            this.selectOptionAndVerify(inputSelectCmp, "Toronto");
            this.selectOptionAndVerify(inputSelectCmp, "Quebec");
            this.verifyCannotSetValue(inputSelectCmp, "Montreal");
        }
    },

    testMultiSelectInRenderIf : {
        attributes :{
            multi:"true",
            condition:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectRenderIf");
            this.selectMultipleOptionsAndVerify(inputSelectCmp, [ "Toronto", "Quebec"]);

            this.selectOptions(inputSelectCmp, ["Montreal", "Quebec"]);
            this.verifyComponentValue(inputSelectCmp, "Quebec")
            this.verifyNotSelected(inputSelectCmp, "Montreal");
        }
    },

    testSelectInOptionGroup : {
        attributes :{
            multi:"false"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectOptionGroup");
            this.selectOptionAndVerify(inputSelectCmp, "Quebec");
            this.selectOptionAndVerify(inputSelectCmp, "Toronto");
        }
    },

    testMultiSelectInOptionGroup : {
        attributes :{
            multi:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectOptionGroup");
            this.selectMultipleOptionsAndVerify(inputSelectCmp, ["Ottawa", "Toronto", "Quebec"]);

            this.selectOptions(inputSelectCmp, ["Toronto", "Calgary"])
            this.verifyComponentValue(inputSelectCmp, "Toronto")
            this.verifyNotSelected(inputSelectCmp, "Calgary");
        }
    },

    testSelectRenderIfInIteration : {
        attributes :{
            multi:"false"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectRenderIfCondition");
            this.selectOptionAndVerify(inputSelectCmp, "Ottawa");
            this.selectOptionAndVerify(inputSelectCmp, "Toronto");
            this.selectOptionAndVerify(inputSelectCmp, "Vancouver");
            this.verifyCannotSetValue(inputSelectCmp, "Calgary")
        }
    },

    testMultiSelectRenderIfInIteration : {
        attributes :{
            multi:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectRenderIfCondition");
            this.selectMultipleOptionsAndVerify(inputSelectCmp, ["Ottawa", "Vancouver", "Toronto"]);

            this.selectOptions(inputSelectCmp, ["Ottawa", "Calgary", "Edmonton"]);
            this.verifyComponentValue(inputSelectCmp, "Ottawa");
            this.verifyNotSelected(inputSelectCmp, "Calgary");
            this.verifyNotSelected(inputSelectCmp, "Edmonton");
        }
    },

    testSelectWhenNestedOptions : {
        attributes :{
            multi:"false"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectNested");
            this.selectOptionAndVerify(inputSelectCmp, "Quebec");
            this.selectOptionAndVerify(inputSelectCmp, "Ottawa");
            this.selectOptionAndVerify(inputSelectCmp, "Toronto");
            this.selectOptionAndVerify(inputSelectCmp, "Vancouver");
            this.verifyCannotSetValue(inputSelectCmp, "Calgary")
        }
    },

    testMultiSelectWhenNestedOptions : {
        attributes :{
            multi:"true"
        }, test : function(cmp) {
            var inputSelectCmp = cmp.find("InputSelectNested");
            this.selectMultipleOptionsAndVerify(inputSelectCmp, ["Ottawa", "Vancouver", "Quebec"]);

            this.selectOptions(inputSelectCmp, ["Ottawa", "Calgary", "Edmonton"]);
            this.verifyComponentValue(inputSelectCmp, "Ottawa");
            this.verifyNotSelected(inputSelectCmp, "Calgary");
            this.verifyNotSelected(inputSelectCmp, "Edmonton");
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