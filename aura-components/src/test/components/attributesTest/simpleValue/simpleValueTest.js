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
        	var value = cmp.get('v.strAttribute');
            $A.test.assertUndefined(value, "Uninitialized simple attribute should be represented as undefined.");

            $A.test.assertTruthy(cmp.get('v.intAttribute'),
                    "Initialized simple attribute should not be represented as undefined.");
            $A.test.assertEquals(3, cmp.get('v.intAttribute'),
            "Simple value object failed to retrieve assigned value.");
        }
    },

    // dirty value in action should not get overwritten in rerender when evaluating functions
    testMakeDirtyIndirectly:{
    	attributes:{intAttribute:100},
    	test:[function(cmp){
    		var button = cmp.find("button");
    		$A.test.assertEquals(false, cmp.isDirty("v.intAttribute"));
    		$A.test.assertEquals(100, cmp.get("v.intAttribute"));

    		$A.test.assertEquals(false, button.isDirty("v.label"));
    		$A.test.assertEquals(100, button.get("v.label"));

    		button.get("e.press").fire();
    	}, function(cmp){
    		var button = cmp.find("button");
    		$A.test.assertEquals(false, cmp.isDirty("v.intAttribute"));
    		$A.test.assertEquals(101, cmp.get("v.intAttribute"));
    		$A.test.assertEquals(false, button.isDirty("v.label"));
    		$A.test.assertEquals(101, button.get("v.label"));

    		button.get("e.press").fire();
    	}, function(cmp){
    		var button = cmp.find("button");
    		$A.test.assertEquals(false, cmp.isDirty("v.intAttribute"));
    		$A.test.assertEquals(102, cmp.get("v.intAttribute"));
    		$A.test.assertEquals(false, button.isDirty("v.label"));
    		$A.test.assertEquals(102, button.get("v.label"));
    	}]
    },

    verifyErrors:function(cmp, expression, expectedErrors){
        var err = cmp.getErrors(expression);
        $A.test.assertTrue($A.util.isArray(err));
        $A.test.assertEquals( expectedErrors.length, err.length);
        for(var i in expectedErrors){
            $A.test.assertEquals( expectedErrors[i], err[i]);
        }
    }
})
