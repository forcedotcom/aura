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
    testClickingButtonFiresAttachedEvent:{
        test:function(cmp){
            cmp.addEventHandler("expressionEvent",function(){
                cmp.set("v.fired",true);
            });
            
            cmp.find("target").getElement().click();
            var actual=cmp.get("v.fired");

            $A.test.assertTrue(actual,"Did not catch expected event.");
        }
    },
    testAttachedEventHasOriginalEventSource:{
        test:[
            function eventSourceIsSet(cmp){
                cmp.addEventHandler("expressionEvent",function(event){
                    cmp.set("v.event",event);
                });
                
                cmp.find("target").getElement().click();
                var actual=cmp.get("v.event").getSourceEvent();

                $A.test.assertNotUndefinedOrNull(actual,"Did not catch expected event.");            
            },
            function eventIsHandleEventTestEventType(cmp){
                var expected="handleEventTest:event";

                var actual=cmp.get("v.event").getType();

                $A.test.assertEquals(expected,actual);
            },
            function eventIsNamedExpressionEvent(cmp){
                var expected="expressionEvent";

                var actual=cmp.get("v.event").getName();

                $A.test.assertEquals(expected,actual);
            },
            function sourceEventIsUiPressEventType(cmp){
                var expected="ui:press";

                var actual=cmp.get("v.event").getSourceEvent().getType();

                $A.test.assertEquals(expected,actual);
            },
            function sourceEventIsNamedPress(cmp){
                var expected="press";

                var actual=cmp.get("v.event").getSourceEvent().getName();

                $A.test.assertEquals(expected,actual);
            },
            function sourceEventComesFromTargetButton(cmp){
                var expected=cmp.find("target");

                var actual=cmp.get("v.event").getSourceEvent().getSource();

                $A.test.assertEquals(expected,actual);               
            }
        ]
    }
})