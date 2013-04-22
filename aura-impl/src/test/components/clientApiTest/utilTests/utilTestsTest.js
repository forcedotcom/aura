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
    testValidComponent : {
        test : function(cmp){
            $A.test.assertTrue( $A.util.isComponent(cmp), "Should be a component");
        }
    },

    testUndefined: {
        test : function(cmp){
            var foo;
            $A.test.assertFalse( $A.util.isComponent(foo), "Should not be a component");
        }
    },

    testNull: {
        test : function(cmp){
            var foo = null;
            $A.test.assertFalse( $A.util.isComponent(foo), "Should not be a component");
        }
    },

    testNoAuraType: {
        test : function(cmp){
            var foo = {};
            $A.test.assertFalse( $A.util.isComponent(foo), "Should not be a component");
        }
    },

    testGetAndSetDataAttributes: {
        test : function(cmp){
            var div = cmp.find("aDiv").getElement();
            var data = $A.util.getDataAttribute(div, "testData");
            $A.test.assertEquals("divtestdata", data, "Could not retrieve data attribute hardcoded on div");

            $A.util.setDataAttribute(div, "testData", "newdata");
            data = $A.util.getDataAttribute(div, "testData");
            $A.test.assertEquals("newdata", data, "Could not set data attribute to new value");

            $A.util.setDataAttribute(div, "testMonkey", "bananas");
            var newAttrVal = $A.util.getDataAttribute(div, "testMonkey");
            $A.test.assertEquals("bananas", newAttrVal, "Setting data attribute with new key should create data attribute");
        }
    },

    /**
     * Verify setting data attribute to undefined removes it from dom element
     */
    testRemoveDataAttribute: {
        test : function(cmp){
            var div = cmp.find("aDiv").getElement();
            $A.test.assertTrue(div.hasAttribute("data-test-data"), "Data attribute not present on div");
            $A.util.setDataAttribute(div, "testData", undefined);
            $A.test.assertFalse(div.hasAttribute("data-test-data"), "Setting data attribute with undefined value " +
                "should remove the attribute");
        }
    },

    testDataAttributeInvalidNodeType: {
        test : function(cmp){
            var textNode = cmp.find("aDiv").getElement().childNodes[0];
            $A.util.setDataAttribute(textNode, "monkey", "shouldntWork");
            $A.test.assertNull($A.util.getDataAttribute(textNode, "monkey"), "Should not be able to set data " +
                "attributes on text nodes");
        }
    }
})
