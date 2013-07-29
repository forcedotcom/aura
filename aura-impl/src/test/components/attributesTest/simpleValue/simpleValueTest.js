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
    testSimpleValueProperties:{
        attributes:{intAttribute:3},
        test:function(cmp){
            var valueObj = cmp.getAttributes().getValue('strAttribute');
            $A.test.assertTruthy(valueObj, "Simple attribute is not defined by a value object.");
            $A.test.assertEquals('SimpleValue', valueObj.toString(),
                    "Simple attribute should be represented using SimpleValue");
            $A.test.assertEquals('Value', valueObj.auraType,
                    "Simple value object has wrong value for auraType attribute");
            $A.test.assertFalsy(valueObj.getValue(), "Uninitialized simple attribute should be represented as undefined.");

            $A.test.assertTruthy(cmp.getAttributes().getValue('intAttribute'),
                    "Initialized simple attribute should not be represented as undefined.");
            $A.test.assertEquals(3, cmp.getAttributes().getValue('intAttribute').getValue(),
            "Simple value object failed to retrieve assigned value.");
        }
    },
    
    testSimpleValueIsValid: {
        test:function(cmp){
            var valueObj = cmp.getAttributes().getValue('strAttribute');
            $A.test.assertTruthy(valueObj.isValid());
        }
    },
    
    testSimpleValueSetUnValid: {
        test:function(cmp){
            var valueObj = cmp.getAttributes().getValue('strAttribute');
            valueObj.setValid(false);
            $A.test.assertTruthy(!valueObj.isValid());
        }
    },
    
    testDerivedTypes:{
        test: function(cmp) {
            var valueObj = cmp.getAttributes().getValue('strAttribute');
            var mval = $A.expressionService.create(null,
                     {"string":"something","integer":23,"boolean":true});
            // Because the types aren't exported, getting the constructors is a bit awkward:
            var simpleValue = valueObj.constructor;
            var mapValue = mval.constructor;
            var attributeValue;  // This is the tricky one, since it's obfuscated!
            for (var key in valueObj) {
                if (!valueObj.hasOwnProperty(key) && typeof(valueObj[key]) === "object" && valueObj[key].constructor) {
                    attributeValue = valueObj[key].constructor;
                    break;
                }
            }
            $A.test.assertTrue($A.util.instanceOf(valueObj, simpleValue),
                     "$A.util.instanceOf says strAttribute is not a SimpleValue");
            $A.test.assertTrue($A.util.instanceOf(valueObj, attributeValue),
                    "$A.util.instanceOf says strAttribute is not an AttributeValue");
            $A.test.assertFalse($A.util.instanceOf(valueObj, mapValue),
                    "$A.util.instanceOf says strAttribute is a MapValue");
        }
    },
    
    testErrorFunctionsOnSimpleValueObject:{
        attributes:{intAttribute:3},
        test:function(cmp){
            //Attribute with no default value
            var valueObj = cmp.getAttributes().getValue('strAttribute');
            valueObj.clearErrors();
            this.verifyErrors(valueObj,[]);

            //Boundary cases for argument
            valueObj.addErrors(undefined);
            valueObj.addErrors();
            valueObj.addErrors(null);
            this.verifyErrors(valueObj,[]);

            //Attribute with default value
            valueObj = cmp.getAttributes().getValue('intAttribute');
            valueObj.clearErrors();

            //Add 1 valid error message
            valueObj.addErrors('Something went wrong!');
            this.verifyErrors(valueObj,['Something went wrong!']);

            //Add multiple error messages
            valueObj.clearErrors();
            valueObj.addErrors(['I know what went wrong!', 'fooBared']);
            this.verifyErrors(valueObj,['I know what went wrong!', 'fooBared']);

            //Add a non-literal, non-array error message
            valueObj.clearErrors();
            valueObj.addErrors({1:'I know what went wrong!', 2:'fooBared'});
            var err = valueObj.getErrors();
            $A.test.assertEquals( err.length, 1);
            $A.test.assertTrue( $A.util.isObject(err[0]));
        }
    },
    
    // dirty value in action should not get overwritten in rerender when evaluating functions
    testMakeDirtyIndirectly:{
    	attributes:{intAttribute:100},
    	test:function(cmp){
    		var button = cmp.find("button");
    		var val = cmp.getValue("v.intAttribute");
    		$A.test.assertEquals(false, val.isDirty());
    		$A.test.assertEquals(100, val.unwrap());
    		var label = button.getValue("v.label");
    		$A.test.assertEquals(false, label.isDirty());
    		$A.test.assertEquals(100, label.unwrap());
    		
    		button.get("e.press").fire();
    		$A.test.assertEquals(false, val.isDirty());
    		$A.test.assertEquals(101, val.unwrap());
    		$A.test.assertEquals(false, label.isDirty());
    		$A.test.assertEquals(101, label.unwrap());

    		button.get("e.press").fire();
    		$A.test.assertEquals(false, val.isDirty());
    		$A.test.assertEquals(102, val.unwrap());
    		$A.test.assertEquals(false, label.isDirty());
    		$A.test.assertEquals(102, label.unwrap());
    	}
    },
    
    verifyErrors:function(valueObj, expectedErrors){
        var err = valueObj.getErrors();
        $A.test.assertTrue($A.util.isArray(err));
        $A.test.assertEquals( expectedErrors.length, err.length);
        for(var i in expectedErrors){
            $A.test.assertEquals( expectedErrors[i], err[i]);
        }
    }
})
