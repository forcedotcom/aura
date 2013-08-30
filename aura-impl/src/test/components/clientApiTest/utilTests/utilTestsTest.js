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
            var foo;
            $A.test.assertFalse( $A.util.isComponent(foo), "undefined: Should not be a component");

            foo = null;
            $A.test.assertFalse( $A.util.isComponent(foo), "null: Should not be a component");

            foo = {};
            $A.test.assertFalse( $A.util.isComponent(foo), "empty object: Should not be a component");

            $A.test.assertTrue( $A.util.isComponent(cmp), "Should be a component");
        }
    },

    testValidValueObject : {
        test : function(cmp){
            var foo;
            $A.test.assertFalse( $A.util.isValue(foo), "undefined: Should not be a value object");

            foo = null;
            $A.test.assertFalse( $A.util.isValue(foo), "null: Should not be a component");

            foo = {};
            $A.test.assertFalse( $A.util.isValue(foo), "empty object: Should not be a component");

            foo = $A.expressionService.create(null, "");
            $A.test.assertTrue( $A.util.isValue(foo), "Should be a value object");
            $A.test.assertEquals( "SimpleValue", foo.toString(), "Should be a SimpleValue");

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
            $A.test.assertFalse($A.util.isUndefinedOrNull(div.getAttribute("data-test-data")), "Data attribute not present on div");
            $A.util.setDataAttribute(div, "testData", undefined);
            $A.test.assertTrue($A.util.isUndefinedOrNull(div.getAttribute("data-test-data")), "Setting data attribute with undefined value " +
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
    },
    
    /**
     * Verify $A.util.isComponent() API
     */
    testIsComponent : {
	test:[
	      function(cmp){
		  $A.test.assertTrue($A.util.isComponent(cmp));
		  $A.test.assertTrue($A.util.isComponent(cmp.find("aDiv")));
		  $A.test.assertFalse($A.util.isComponent(cmp.getDef()));
		  $A.test.assertFalse($A.util.isComponent(cmp.getElement()));
		  var valueObj = $A.expressionService.create(null, "literal");
		  $A.test.assertFalse($A.util.isComponent(valueObj));
	      },
	      function(cmp){
		  $A.test.assertFalse($A.util.isComponent(""));
		  $A.test.assertFalse($A.util.isComponent(undefined));
		  $A.test.assertFalse($A.util.isComponent(null));
		  $A.test.assertFalse($A.util.isComponent());
	      }
	      ]
    }
})
