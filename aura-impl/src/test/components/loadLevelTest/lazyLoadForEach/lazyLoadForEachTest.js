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
    testLazyLoadingSimpleComponentInforEach:{
        test:function(cmp){
            aura.test.setTestTimeout(15000)
            var valuesAtTopLevelValue = cmp.getValue('m.stringList');
            var valuesAtTopLevel = valuesAtTopLevelValue.unwrap();
            aura.test.assertEquals(3, valuesAtTopLevelValue.getLength(), "Expected 3 values from model.");
            aura.test.assertEquals(3, valuesAtTopLevel.length, "Expected 3 values from model.");

            var innerCmps = cmp.find('stringValue');
            aura.test.assertEquals(3, innerCmps.length, "Expected 3 iterations of forEach.");
            //Assert that initially there are only placeholders
            //This flaps if the server is too fast
            /*for(var i=0; i<innerCmps.length;i++){
                $A.test.assertEquals("placeholder", innerCmps[i].getDef().getDescriptor().getName(), "Expected to see placeholders initially for lazy components.");
            }*/

            $A.test.addWaitFor("forEachDefDisplay", function(){
                return cmp.find('stringValue')[0].getDef().getDescriptor().getName();
            }, function(){
                innerCmps = cmp.find('stringValue');
                for(var i=0; i<3;i++){
                    var  stringValueAtInnerCmp = innerCmps[i].get("v.string");
                    aura.test.assertEquals(valuesAtTopLevel[i], stringValueAtInnerCmp, "Failed to load lazy component from server.");
                    aura.test.assertEquals(''+valuesAtTopLevel[i], innerCmps[i].find('string').getElement().textContent, "value mismatch.");
                }
            });
        }
    },
})
