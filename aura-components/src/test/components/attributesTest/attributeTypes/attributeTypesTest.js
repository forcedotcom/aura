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
    testIntegerType: {
        attributes: {
            typeInteger: 123
        },
        test: function(cmp) {
            var value = cmp.get("v.typeInteger");
            $A.test.assertTrue(typeof value === "number");
        }
    },

    testMapTypeFromRawObject: {
        attributes: {
            typeMap: { "k1":"value", k2: "v2", k3: { k4:"v4", 'k5':"v5" }, k6: [{ k7:"v7" }, 999] }
        },
        test: [
            function(cmp) {
                var value = cmp.get("v.typeMap");
                $A.test.assertEquals("object", typeof value);

                $A.test.assertEquals("value", value.k1);

                $A.test.assertEquals("v2", value.k2);

                $A.test.assertEquals("v4", value.k3.k4);
                $A.test.assertEquals("v5", value.k3.k5);

                $A.test.assertTrue($A.util.isArray(value.k6));
                $A.test.assertEquals("v7", value.k6[0].k7);
                $A.test.assertEquals(999, value.k6[1]);
            }
        ]
    },

    testListTypeFromRawArray: {
        attributes: {
            typeList: ["one", "two", "three"]
        },
        test: [
               function(cmp) {
                   var value = cmp.get("v.typeList");
                    $A.test.assertTrue($A.util.isArray(value));
                    $A.test.assertEquals(3, value.length);
                    $A.test.assertEquals("two", value[1]);
               }
        ]
    },

    //we don't do type check for List, pass whatever you want, it will stay that way
    testStringListTypeFromRawArray: {
        attributes: {
            typeStringList: ["one", "two", 3, { k4: 4 }]
        },
        test: [
               function(cmp) {
                    var value = cmp.get("v.typeStringList");
                    $A.test.assertTrue($A.util.isArray(value));
                    $A.test.assertEquals(4, value.length);

                    $A.test.assertTrue(typeof value[1] === "string");
                    $A.test.assertEquals("two", value[1]);

                    $A.test.assertTrue(typeof value[2] === "number");
                    $A.test.assertEquals(3, value[2]);

                    $A.test.assertTrue(typeof value[3] === "object");
                    $A.test.assertEquals(4, value[3].k4);
               }
        ]
    },

    testMapListType: {
        attributes: {
            typeMapList: [ {id: "0"}, {id: 1}, {id: "2"}, [111, 222, {k3: 333} ] ]
        },
        test: [
            function(cmp) {
                var value = cmp.get("v.typeMapList");
                $A.test.assertTrue($A.util.isArray(value));

                $A.test.assertEquals("0", value[0].id);
                $A.test.assertEquals(1, value[1].id);

                $A.test.assertEquals(111, value[3][0]);
                $A.test.assertEquals(333, value[3][2].k3);
            }
        ]
    },

    testEmptyList: {
        attributes: {
            typeList: []
        },
        test: [
            function(cmp) {
                var value = cmp.get("v.typeList");
                $A.test.assertTrue($A.util.isArray(value));
                $A.test.assertEquals(0, value.length);
            }
        ]
    },

    testSetFromArray : {
        attributes : {
            typeSet : [4, 1, "3", 5]
        },
        test : function(cmp) {
            var except = [1, "3", 4, 5];
            var actual = cmp.get("v.typeSet");
            $A.test.assertTrue($A.util.isArray(actual));
            // Set is unordered
            var result = $A.test.compareValues(except.sort(), actual.sort());
            $A.test.assertTrue(result['match'], result['reasons']);
        }
    },

    testSetFromArrayWithStringContainsBracket : {
        attributes : {
            typeSet : ['[1]','2','3']
        },
        test : function(cmp) {
            var except = ['[1]','2','3'];
            var actual = cmp.get("v.typeSet");
            $A.test.assertTrue($A.util.isArray(actual));
            // Set is unordered
            var result = $A.test.compareValues(except.sort(), actual.sort());
            $A.test.assertTrue(result['match'], result['reasons']);
        }
    },

    testCustomTypeDefault:{
        test:function(cmp){
            var customAttrValue = cmp.get('v.pairAttr');
            $A.test.assertNotNull(customAttrValue);
            //Verify the type and value of attribute value
            $A.test.assertEquals(300, customAttrValue.intMember,
                    "Failed to construct attribute value of custom type.");
            $A.test.assertEquals("HouseNo", customAttrValue.strMember,
                    "Failed to construct String attribute value of custom type.");
        }
    },
    
    testSetBodyAsNonArray: {
        test: function(cmp) {
            var body = "text";
            var value;
            
            cmp.set("v.body", body);
            value = cmp.get("v.body");
            
            $A.test.assert($A.util.isArray(value), "Body was of the wrong type, it was of type " + typeof value);
        }
    }
})
