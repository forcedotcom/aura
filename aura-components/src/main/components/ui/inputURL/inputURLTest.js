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
     * Verify that initially cmp's value is unassigned
     */
    testUnassigned: {
        test: function(cmp) {
            $A.test.assertEquals(undefined, cmp.get("v.value"));
        }
    },

    /**
     * Verify that empty string works and doesn't set to undefined or null
     */
    testEmptyString: {
        attributes: {value: ""},
        test: function(cmp) {
            $A.test.assertEquals("", cmp.get("v.value"));
        }
    },

    /**
     * Verify that input element's type is correct
     */
    testTypeIsCorrect: {
        test: function(cmp) {
            this.assertInputAttribute(cmp, "type", "url");
        }
    },

    /**
     * Verify that placeholder attribute can be set
     */
    testPlaceholder: {
        attributes: {placeholder: "test"},
        test: function(cmp) {
            this.assertInputAttribute(cmp, "placeholder", "test");
        }
    },

    /**
     * Verify that maxlength attribute can be set
     */
    testMaxlength: {
        attributes: {maxlength: 5},
        test: function(cmp) {
            this.assertInputAttribute(cmp, "maxlength", "5");
        }
    },

    /**
     * Verify that size attribute can be set
     */
    testSize: {
        attributes: {size: 5},
        test: function(cmp) {
            this.assertInputAttribute(cmp, "size", "5");
        }
    },

    /**
     * Verify that input can be set to 'required' for forms
     */
    testRequired: {
        test: [function(cmp) {
            this.assertInputAttribute(cmp, "required", false);
            cmp.set("v.required", true);
        }, function(cmp) {
            this.assertInputAttribute(cmp, "required", true);
        }]
    },

    /**
     * Verify that input can be disabled
     */
    testDisabled: {
        test: [function(cmp) {
            this.assertInputAttribute(cmp, "disabled", false);
            cmp.set("v.disabled", true);
        }, function(cmp) {
            this.assertInputAttribute(cmp, "disabled", true);
        }]
    },

    /**
     * Verify that label gets added correctly and that input is accessible
     */
    testAccessible: {
        attributes: {label: "test"},
        test: function() {
            $A.test.assertAccessible();
        }
    },

    /*****************************************************
     * Helper Functions
     *****************************************************

    /**
     * Assert whether attribute of cmp's input element is set to expectedValue
     */
    assertInputAttribute: function(cmp, attributeName, expectedValue) {
        var elm = $A.test.select("input")[0];
        var attribute = elm.getAttribute(attributeName);
        var errMsg = "&lt;input&gt;'s attribute '"+attributeName+"' should be set to '"+expectedValue+"'";
        
        if (typeof expectedValue === "boolean") {
            // bool for attributes like disabled, checked, etc.
            // they work as long as they are defined
            if (expectedValue) {
                $A.test.assertNotUndefinedOrNull(attribute, errMsg);
            } else {
                $A.test.assertUndefinedOrNull(attribute, errMsg);
            }
        } else {
            $A.test.assertEquals(expectedValue, attribute, errMsg);
        }
    }
})// eslint-disable-line semi
