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
            cmp.getValue("v.body").push($A.componentService.newComponent("attributesTest:defaultValue"));
            $A.eventService.finishFiring();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            //Wait till placeholder is replaced by actual component that was specified in newCmp()
            this.assertAfterLazyLoading(body[0],"markup://attributesTest:defaultValue",
                    function(){
                        var newCmp = this.extractCmpFromPlaceholder(body[0],"markup://attributesTest:defaultValue");
                        //Verify attributes with default value
                        $A.test.assertEquals("Aura", newCmp.getAttributes().get("strAttributeWithDefaultValue"),
                                "Failed to set default value of simple attributes on client side component");
                        $A.test.assertEquals("['red','green','blue']", newCmp.getAttributes().get("objAttributeWithDefaultValue"));

                        var listAttr = newCmp.getAttributes().getValue("listAttributeWithDefaultValue");
                        $A.test.assertTrue(listAttr.toString() === "ArrayValue",
                                "Expected to find attribute of ArrayValue type but found"+listAttr.constructor);
                        $A.test.assertEquals("Value", listAttr.auraType);
                        $A.test.assertEquals("true", listAttr.getValue(0).getValue());
                        $A.test.assertEquals("false", listAttr.getValue(1).getValue());
                        $A.test.assertEquals("true", listAttr.getValue(2).getValue());

                        //Verify attributes without a default value
                        $A.test.assertFalsy(newCmp.getAttributes().get("strAttributeWithNoDefaultValue"),
                            "Attributes without default value should have undefined as value");
                        $A.test.assertFalsy(newCmp.getAttributes().get("objAttributeWithNoDefaultValue"),
                            "Attributes without default value should have undefined as value");
                        var a = newCmp.getAttributes().get("listAttributeWithNoDefaultValue");
                        $A.test.assertTrue($A.util.isArray(a));
                        $A.test.assertEquals(0, a.length,
                                "Array type attributes without default value should have empty as value");
                    });

        }
    },
    /**
     * Wait till the placeholder is replaced by actual component and call the callback function.
     */
    assertAfterLazyLoading:function(placeholder, expectedComponent, callback){
        var extractCmpFromPlaceholder = this.extractCmpFromPlaceholder;
        $A.test.addWaitFor(true,
                function(){
                        return !!extractCmpFromPlaceholder(placeholder,expectedComponent);
                },callback);
    },
    /**
     * The target component to be loaded is inserted into the body of the placeholder.
     * This function return the component when its found in the body of the placeholder else it returns nothing.
     */
    extractCmpFromPlaceholder:function(placeholder, cmpName){
        var body = placeholder.get("v.body");
        var ret;
        
         if(body && body.length > 0){
        	for(var key in body){
                var obj = body[key];
                if ($A.util.isComponent(obj)) {
                    if (obj.getDef().getDescriptor().getQualifiedName() === cmpName){
                        ret = obj;
                    }
                }
        	}         
        }
        return ret;
    }
})
