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
    		typeMap: { "prop":"value" }
    	},
    	test: [
    	    function(cmp) {
    	    	var value = cmp.get("v.typeMap");
		    	$A.test.assertEquals("object", typeof value);	
		    },
		    function(cmp) {
    	    	var value = cmp.get("v.typeMap");
		    	$A.test.assertEquals("value", value.prop);		    	
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
    	       },
    	       function(cmp) {
    	    	   var list = cmp.get("v.typeList");
    	    	   $A.test.assertEquals(3, list.length);
    	       }
    	]
    },
    
    testTypedListFromRawArray: {
    	attributes: {
    		typeStringList: ["one", "two", "three"]
    	},
    	test: [
    	       function(cmp) {
    	    	   var value = cmp.get("v.typeStringList");
		    		$A.test.assertTrue($A.util.isArray(value));
    	       },
    	       function(cmp) {
    	    	   var list = cmp.get("v.typeStringList");
    	    	   $A.test.assertEquals(3, list.length);
    	       }
    	]
    },

    testTypedListOfObjects: {
        attributes: {
            typeMapList: [ {id: "0"}, {id: 1}, {id: "2"} ]
        },
        test: [ 
            function(cmp) {
                var value = cmp.get("v.typeMapList");
                $A.test.assertTrue($A.util.isArray(value));
            }, 
            function(cmp) {
                var value = cmp.get("v.typeMapList");
                $A.test.assertEquals("0", value[0].id);
            },
            function(cmp) {
                var value = cmp.get("v.typeMapList");
                $A.test.assertEquals(1, value[1].id);
            }
        ]
    },

    testListFromString: {
        attributes: {
            typeList: "[1,2]"
        },
        test: [
            function(cmp) {
                var value = cmp.get("v.typeList");
                $A.test.assertTrue($A.util.isArray(value));
            },
            function(cmp) {
                var value = cmp.get("v.typeList");
                $A.test.assertEquals(1, value[0]);
            },
            function(cmp) {
                var value = cmp.get("v.typeList");
                $A.test.assertEquals(2, value[1]);
            }
        ]
    }
})