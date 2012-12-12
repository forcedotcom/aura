/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    testBasicDataTypeAndDefaultValue:{
        test:function(cmp){
            this.verifyDefaultValuesOfBasicDataType(cmp);
        }
    },
    testObjectDataTypeAndDefaultValue:{
        test:function(cmp){
            this.verifyDefaultValuesOfObjectDataType(cmp);
        }
    },
    testListDataTypeAndDefaultValue:{
        test:function(cmp){
            this.verifyDefaultValuesOfListDataType(cmp);
        }
    },
    testCaseSensitivity:{
        test:function(cmp){
            $A.test.assertEquals("Aura", cmp.getAttributes().get("strATTRIBUTEWithDefaultValue"));
            $A.test.assertFalsy(cmp.getAttributes().get("strATTRIBUTEWithNODefaultValue"));
        }
    },
    testDefaultValueOfNonExistingAttribute:{
        test:function(cmp){
            $A.test.assertFalsy(cmp.getAttributes().get("fooBar"), "Should not be able to read non existing attributes.");
            try{
                $A.test.assertFalsy(cmp.getAttributes().getValue(undefined));
                $A.test.fail("Should not be able to use undefined in getValue()");
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: Key is required for getValue on MapValue : undefined", e.message)
            }
            try{
                $A.test.assertFalsy(cmp.getAttributes().getValue(null));
                $A.test.fail("Should not be able to use null in getValue()");
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: Key is required for getValue on MapValue : null", e.message)
            }
            try{
                $A.test.assertFalsy(cmp.getAttributes().getValue());
                $A.test.fail("Should not be able to use null in getValue()");
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: Key is required for getValue on MapValue : undefined", e.message)
            }
            /**W-1324218
             * try{
                $A.test.assertFalsy(cmp.getAttributes().get(null));
                $A.test.fail("Should not be able to use null in get()");
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: Key is required for get on MapValue : null", e.message)
            }
            try{
                $A.test.assertFalsy(cmp.getAttributes().get(undefined));
                $A.test.fail("Should not be able to use undefined in get()");
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: Key is required for get on MapValue : undefined", e.message)
            }
            try{
                $A.test.assertFalsy(cmp.getAttributes().get());
                $A.test.fail("Should not be able to use undefined in get()");
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: Key is required for get on MapValue : undefined", e.message)
            }
            */
        }
    },
    /**
     * Verify that a locally created component has the same set of default attribute values.
     * In this case the component being creates already has its def at the client.
     */
    testDefaultValueOfNewLocalComponentWithDefAtClient:{
        test:function(cmp){
            var newCmp = $A.newCmp("markup://attributesTest:defaultValue");
            this.verifyDefaultValuesOfBasicDataType(newCmp);
            this.verifyDefaultValuesOfObjectDataType(newCmp);
            //W-1324216
            //this.verifyDefaultValuesOfListDataType(newCmp);
            this.verifyChangingAttributeValues(newCmp);
        }
    },

    testChangingAttributesWithDefalutValue:{
        test:function(cmp){
            this.verifyChangingAttributeValues(cmp);
        }
    },

    verifyDefaultValuesOfBasicDataType:function(testCmp){
        $A.test.assertEquals("Aura", testCmp.getAttributes().get("strAttributeWithDefaultValue"),
                "Failed to see default value of String attribute.");
        //The other way of accessing a attribute value.
        $A.test.assertEquals("Aura", testCmp.getAttributes().getValue("strAttributeWithDefaultValue").getValue());
        $A.test.assertFalsy(testCmp.getAttributes().get("strAttributeWithNoDefaultValue"),
                "Attributes without default value should have undefined as value");
    },

    verifyDefaultValuesOfObjectDataType:function(testCmp){
        $A.test.assertEquals("['red','green','blue']", testCmp.getAttributes().get("objAttributeWithDefaultValue"),
                "Failed to see default value of object attribute.");
        $A.test.assertEquals("['red','green','blue']", testCmp.getAttributes().getValue("objAttributeWithDefaultValue").getValue());
        $A.test.assertFalsy(testCmp.getAttributes().get("objAttributeWithNoDefaultValue"),
                "Attributes without default value should have undefined as value");
    },

    verifyDefaultValuesOfListDataType:function(testCmp){
        var listAttr = testCmp.getAttributes().getValue("listAttributeWithDefaultValue");
        $A.test.assertTrue(listAttr.toString() === "ArrayValue",
                "Expected to find attribute of ArrayValue type but found"+listAttr.constructor);
        $A.test.assertEquals("Value", listAttr.auraType);
        $A.test.assertEquals("true", listAttr.getValue(0).getValue());
        $A.test.assertEquals("false", listAttr.getValue(1).getValue());
        $A.test.assertEquals("true", listAttr.getValue(2).getValue());

        var a = testCmp.getAttributes().get("listAttributeWithNoDefaultValue");
        $A.test.assertTrue($A.util.isArray(a));
        $A.test.assertEquals(0, a.length,
                "Array type attributes without default value should have empty as value");
    },
    verifyChangingAttributeValues:function(testCmp){
        testCmp.getAttributes().setValue("strAttributeWithDefaultValue", "nemuL");
        $A.test.assertEquals("nemuL", testCmp.getAttributes().getValue("strAttributeWithDefaultValue").getValue(),
                "Failed to change value of attribute.");

        testCmp.getAttributes().setValue("strAttributeWithNoDefaultValue", "Saturday Night Live");
        $A.test.assertEquals("Saturday Night Live", testCmp.getAttributes().getValue("strAttributeWithNoDefaultValue").getValue(),
                "Failed to change value of attribute.");

        testCmp.getAttributes().setValue("objAttributeWithDefaultValue", "['white','black']")
        $A.test.assertEquals("['white','black']", testCmp.getAttributes().get("objAttributeWithDefaultValue"),
                "Failed to change value of attribute.");

        testCmp.getAttributes().setValue("fooBar", "Jacked")
        $A.test.assertFalsy(testCmp.getAttributes().get("fooBar"),
                "Should not be able to create and set values for unidentified attributes.");
    }
})
