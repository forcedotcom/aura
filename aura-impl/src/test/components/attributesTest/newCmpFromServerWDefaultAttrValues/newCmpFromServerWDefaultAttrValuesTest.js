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
    testNewComponentFromServerWithDefaultValues:{
        test:function(cmp){
        	$A.run(function(){
	            $A.componentService.newComponentAsync(
	                this,
	                function(newCmp){
	                	var body = cmp.get("v.body");
	                	body.push(newCmp);
	                	cmp.set("v.body", body);
	                },
	                "attributesTest:defaultValue"
	            );
            })
            
            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
            	var body = cmp.get('v.body');
                var newCmp = body[0];
                $A.test.assertEquals("markup://attributesTest:defaultValue", newCmp.getDef().getDescriptor().getQualifiedName(),
                        "Failed to create new component: markup://attributesTest:defaultValue");
                
                $A.test.assertEquals("Aura", newCmp.get("v.strAttributeWithDefaultValue"),
                        "Failed to set default value of simple attributes on client side component");
                $A.test.assertEquals("['red','green','blue']", newCmp.get("v.objAttributeWithDefaultValue"));
                
                var listAttr = newCmp.get("v.listAttributeWithDefaultValue");
                $A.test.assertTrue($A.util.isArray(listAttr),
                        "Expected to find attribute of Array type but found something else");
                $A.test.assertEquals("true", listAttr[0]);
                $A.test.assertEquals("false", listAttr[1]);
                $A.test.assertEquals("true", listAttr[2]);
                
                // Verify attributes without a default value
                $A.test.assertFalsy(newCmp.get("v.strAttributeWithNoDefaultValue"),
                    "Attributes without default value should have undefined as value");
                $A.test.assertFalsy(newCmp.get("v.objAttributeWithNoDefaultValue"),
                    "Attributes without default value should have undefined as value");
                
                var a = newCmp.get("v.listAttributeWithNoDefaultValue");
                $A.test.assertTrue($A.util.isArray(a));
        		$A.test.assertTrue($A.util.isEmpty(a), "Array type attributes without default value should have empty array as value");
            });
        }
    }
})
