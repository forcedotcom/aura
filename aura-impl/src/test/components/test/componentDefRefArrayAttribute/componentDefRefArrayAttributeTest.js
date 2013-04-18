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
    testTypeDefDescriptor: {
        test: [function(cmp){
                $A.test.assertEquals("aura://Aura.ComponentDefRef[]", cmp.getDef().getAttributeDefs().getDef("cdrs").getTypeDefDescriptor().toString());
        }]
    },


    /**
     * Ensure that the attribute of type ComponentDefRef[] doesn't get instantiated, like it would if it was of type Component[]
     * And then make sure it can be instantiated.
     */
    testValue : {

        test : [
            function(cmp){
                var value = cmp.getValue("v.cdrs");
                $A.test.assertEquals("ArrayValue", value.toString());
                $A.test.assertEquals(1, value.getLength());
                value = value.get(0);
                //Make sure it looks like a cdr.
                $A.test.assertTrue(typeof value === "object");
                $A.test.assertEquals(undefined, value.auraType);
                $A.test.assertTrue(value.componentDef !== undefined);
                $A.test.assertEquals("markup://ui:button", value.componentDef.descriptor);
                //construct it.
                value = $A.newCmp(value);
                $A.test.assertEquals("Component", value.auraType);
                $A.test.assertEquals("markup://ui:button", value.getDef().getDescriptor().toString());
                $A.test.assertEquals("hi", value.get("v.label"));
            }
        ]
    }
})
