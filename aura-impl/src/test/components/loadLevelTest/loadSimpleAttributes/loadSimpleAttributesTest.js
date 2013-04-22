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
    testUndefinedValues:{
        test:[function(cmp){
            try{
                var helper= cmp.getDef().getHelper();
                helper.verifyLazyLoading(cmp, {'stringAttribute':'markup://aura:expression',
                                          'integerAttribute':'markup://loadLevelTest:displayNumber',
                                          'booleanAttribute':'markup://loadLevelTest:displayBoolean'},
                                          "loadSimpleAttributes",
                                          function(){
                                             $A.test.assertEquals("",$A.test.getTextByComponent(cmp.find("stringAttribute")), "Failed to render blank value when a string attribute was not set.");
                                             $A.test.assertEquals("",$A.test.getTextByComponent(cmp.find("integerAttribute")), "Failed to render blank value when a integer attribute was not set.");
                                             $A.test.assertEquals("False",$A.test.getTextByComponent(cmp.find("booleanAttribute")), "Failed to detect undefined boolean value.");
                                          });
            } finally {
                window.setTimeout(function(){$A.test.callServerAction(cmp.get("c.resumeAll"), true)}, 100);
            }
        }]
    },
    testInitialValues:{
        attributes:{'stringAttribute':'lazyLoading',integerAttribute:'99',booleanAttribute:true},
        test:[function(cmp){
            $A.test.addWaitFor(true, $A.test.isActionPending,
                    function(){$A.test.callServerAction(cmp.get("c.resumeAll"), true);});
            $A.test.addWaitFor('markup://aura:expression', function(){
                    return  cmp.find('stringAttribute').getDef().getDescriptor().getQualifiedName();
                },
                function(){
                    $A.test.assertEquals("lazyLoading",$A.test.getTextByComponent(cmp.find("stringAttribute")), "Failed to initialized lazy component with string value.");
                }
           );
            $A.test.addWaitFor('markup://loadLevelTest:displayNumber', function(){
                return  cmp.find('integerAttribute').getDef().getDescriptor().getQualifiedName();
            },
            function(){
                $A.test.assertEquals("99",$A.test.getTextByComponent(cmp.find("integerAttribute")), "Failed to initialized lazy component with integer value.");
            }
           );
            $A.test.addWaitFor('markup://loadLevelTest:displayBoolean', function(){
                    return  cmp.find('booleanAttribute').getDef().getDescriptor().getQualifiedName();
                },
                function(){
                    $A.test.assertEquals("True",$A.test.getTextByComponent(cmp.find("booleanAttribute")), "Failed to initialized lazy component with boolean value.");
                }
            );
        }]
    },
    testRerenderDirtyValuesOnLazyComponents:{
        attributes:{'stringAttribute':'lazyLoading',integerAttribute:'99',booleanAttribute:true},
        test:[function(cmp){
            $A.test.addWaitFor(true, $A.test.isActionPending,
                    function(){$A.test.callServerAction(cmp.get("c.resumeAll"), true);});
            $A.test.addWaitFor('markup://aura:expression', function(){
                return  cmp.find('stringAttribute').getDef().getDescriptor().getQualifiedName();
            });
        },function(cmp){
            $A.services.event.startFiring(true);
            cmp.getAttributes().setValue('stringAttribute','postLoading');
            cmp.getAttributes().setValue('integerAttribute',100 );
            cmp.getAttributes().setValue('booleanAttribute', false );
            $A.services.event.finishFiring();

            $A.test.assertEquals("postLoading",$A.test.getTextByComponent(cmp.find("stringAttribute")), "Failed to rerender dirty string value, could also be a problem with aura:test rerender.");
            $A.test.assertEquals("100",$A.test.getTextByComponent(cmp.find("integerAttribute")), "Failed to rerender dirty integer value, could also be a problem with lumeh:html rerender.");
            //Currently there is a bug here with aura:renderif. Though new elements are created and rendered on screen, component still has reference to old dom elements and not new ones.

            // trim() to pass tests in IE9/IE10
            $A.test.assertEquals("False",$A.util.trim($A.test.getTextByComponent(cmp.find("booleanWrapper"))), "Failed to rerender dirty boolean value.");
        }]
    }
})
