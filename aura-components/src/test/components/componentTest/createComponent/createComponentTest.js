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
    testCreatesTextComponentFromShortDescriptor:{
        test:function(){
            var expected="aura:text";

            $A.createComponent(expected,null,function(targetComponent){
                var actual=$A.util.format(
                    "{0}:{1}",
                    targetComponent.getDef().getDescriptor().getNamespace(),
                    targetComponent.getDef().getDescriptor().getName()
                );

                $A.test.assertEquals(expected,actual);
            })
        }
    },

    testCreatesTextComponentFromFullDescriptor:{
        test:function(){
            var expected="markup://aura:text";

            $A.createComponent(expected,null,function(targetComponent){
                var actual=targetComponent.getDef().getDescriptor().getQualifiedName();

                $A.test.assertEquals(expected,actual);
            })
        }
    },

    testSetsValueOnTextComponent:{
        test:function(){
            var expected="expected";

            $A.createComponent("aura:text",{value:expected},function(targetComponent){
                var actual=targetComponent.get("v.value");

                $A.test.assertEquals(expected,actual);
            })
        }
    },

    testCreatesButtonComponentFromServer:{
        test:function(component){
            $A.test.assertUndefinedOrNull($A.componentService.getDef("ui:button",true));
            $A.createComponent("ui:button",{label:"label"},function(targetComponent){
                $A.test.assertNotNull($A.componentService.getDef("ui:button"));
            })
        }
    },

    testCreatesButtonComponentWithPressEvent:{
        test:function(component){
            component.set("v.handledEvent",false);
            var actual=false;

            $A.createComponent("ui:button",{label:"label",press:component.getReference("c.handlePress")},function(targetComponent){
                component.find("createdComponents").set("v.body",targetComponent);
                $A.test.addWaitFor(true,function(){return targetComponent.isRendered()},function(){
                    targetComponent.getElement().click();
                    actual=component.get("v.handledEvent");
                    $A.test.assertTrue(actual);
                });

            })
        }
    },

    testCreatesButtonWithLocalId:{
        test:function(component){
            var expected=null;
            var actual=null;
            var targetId="testButton";

            $A.createComponent("ui:button",{"aura:id":targetId,label:"label"},function(targetComponent){
                expected=targetComponent;
                component.find("createdComponents").set("v.body",targetComponent);
                $A.test.addWaitFor(true,function(){return targetComponent.isRendered()},function(){
                actual=component.find(targetId);
                    $A.test.assertEquals(expected, actual);
                });
            })
        }
    },

    testCreatesMultipleComponents:{
        test:function(component){
            var expected="12345";
            var actual;

            $A.createComponents([
                ["aura:text",{value:1}],
                ["aura:text",{value:2}],
                ["aura:text",{value:3}],
                ["aura:text",{value:4}],
                ["aura:text",{value:5}]
            ],function(components){
                component.find("createdComponents").set("v.body",components);
                $A.test.addWaitFor(true,function(){return components[4].isRendered()},function(){
                    actual=$A.test.getTextByComponent(component.find("createdComponents"));
                    $A.test.assertEquals(expected, actual);
                });
            })
        }
    },

    testCreatesMultipleServerComponents:{
        test:function(component){
            $A.test.assertUndefinedOrNull($A.componentService.getDef("ui:button",true));
            var expected="12345";
            var actual;

            $A.createComponents([
                ["ui:button",{label:1}],
                ["ui:button",{label:2}],
                ["ui:button",{label:3}],
                ["ui:button",{label:4}],
                ["ui:button",{label:5}]
            ],function(components){
                component.find("createdComponents").set("v.body",components);
                $A.test.addWaitFor(true,function(){return components[4].isRendered()},function(){
                    actual=$A.test.getTextByComponent(component.find("createdComponents"));
                    $A.test.assertEquals(expected, actual);
                });
            })
        }
    }

})