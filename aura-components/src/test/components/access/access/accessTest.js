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
    testComponentCanUseAllAccessLevelsInMarkup:{
        test:function(cmp){
            var expected="PRIVATE\nPUBLIC\nINTERNAL\nGLOBAL";

            var actual=$A.test.getTextByComponent(cmp.find("local"));

            $A.test.assertEquals(expected,actual);
        }
    },

    testComponentCanUseAllAccessLevelsOfAttributesInController:{
        test:[
            function canUsePrivateAttribute(cmp){
                var expected="PRIVATE";
                cmp.set("v.testType","Private");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canUseInternalAttribute(cmp){
                var expected="INTERNAL";
                cmp.set("v.testType","Internal");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canUseGlobalAttribute(cmp){
                var expected="GLOBAL";
                cmp.set("v.testType","Global");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            }
        ]
    },

    _testComponentCanOnlyUseGlobalAttributesOfRemoteComponentInController:{
        test:[
            function canNotUsePrivateAttribute(cmp){
                var expected=null;
                cmp.set("v.testType","Private");

                cmp.find("testRemoteAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canNotUseInternalAttribute(cmp){
                var expected=null;
                cmp.set("v.testType","Internal");

                cmp.find("testRemoteAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canUseGlobalAttribute(cmp){
                var expected="GLOBAL";
                cmp.set("v.testType","Global");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            }
        ]
    },

    testComponentFromExternalNamespaceCanUseAllAccessLevelsInMarkup:{
        test:function(cmp){
            var expected="PRIVATE\nPUBLIC\nINTERNAL\nGLOBAL";

            var actual=$A.test.getTextByComponent(cmp.find("remote"));

            $A.test.assertEquals(expected,actual);
        }
    }
})
