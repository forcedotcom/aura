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
                var actual=targetComponent.getType();

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

    testReturnsSUCCESSStateForLocalComponentType:{
        test:function(){
            var expected="SUCCESS";
            var actual=null;

            $A.createComponent("aura:text",null,function(component,state){
                actual=state;

                $A.test.assertEquals(expected,actual);
            })
        }
    },

    testCreatesButtonComponentFromServer:{
        test:function(){
            var actual;
            var actionComplete = false;

            $A.test.assertUndefinedOrNull($A.componentService.getDef("ui:button",true));
            $A.createComponent("ui:button",{label:"label"},function(){
                actual = $A.componentService.getDef("ui:button", true);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertNotUndefinedOrNull(actual);
            });
        }
    },
    
    /**
     * Test to guard component creation when libraries are attached.
     * Bug: W-2949123
     */
    testAsyncCmpCreationWithLibrary:{
        test:function(){
            var actualDef, actualCmp;
            var actionComplete = false;
            //Verify that component is not already on client (in app.js or in cache)
            $A.test.assertUndefinedOrNull($A.componentService.getDef("test:libraryTest",true));
            $A.createComponent("test:libraryTest", {},function(newCmp){
            	//checks that getDef does not error out when the definition has a library
            	actualDef = $A.componentService.getDef("test:libraryTest", true);
            	actualCmp = newCmp;
            	actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                //verify that the definition was obtained and not error out when the definition has a library
            	$A.test.assertNotUndefinedOrNull(actualDef);
                var helper = actualCmp.getDef().getHelper();
                
                //check for imports exist in cmp
                $A.test.assertDefined(helper.imported);
                $A.test.assertDefined(helper.imported.basicFirst);
                $A.test.assertEquals("BASIC1", helper.imported.basicFirst());
                
                //check for multiple external imports exist in cmp
                $A.test.assertDefined(helper.externallyImported);
                $A.test.assertDefined(helper.externallyImported.handlesMultipleImportsAlso);
                $A.test.assertEquals("EXT_MULTIPLE2:EXT1|EXT2|BASIC1|BASIC2|", helper.externallyImported
                        .handlesMultipleImportsAlso());
            });
        }
    },

    testCreatesButtonComponentWithPressEvent:{
        test:[function(component){
            var actionComplete = false;
            component.set("v.handledEvent",false);

            $A.createComponent("ui:button",{label:"label",press:component.getReference("c.handlePress")},function(targetComponent){
                component.find("createdComponents").set("v.body",targetComponent);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){return actionComplete});
        }, function(component) {
            var createdCmp = component.find("createdComponents").get("v.body")[0].getElement();
            createdCmp.click();
            $A.test.assertTrue(component.get("v.handledEvent"));
        }]
    },

    // TODO(W-2529066): Newly created component not indexed against component it's added to
    _testCreatesButtonWithLocalId:{
        test:[function(component){
            var targetId="testButton";
            var actionComplete = false;

            $A.createComponent("ui:button",{"aura:id":targetId,label:"label"},function(targetComponent){
                component.__createdCmp = targetComponent;
                component.find("createdComponents").set("v.body",targetComponent);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){return actionComplete});
        }, function(component) {
            var targetId="testButton";
            var actual = component.find(targetId);
            $A.test.assertEquals(component.__createdCmp, actual);
        }]
    },

    testReturnsNullForUnknownComponentType:{
        test:function(){
            // Set actual to non null to verify accidental negatives.
            var actual={};
            var actionComplete = false;
            var statusComplete;

            $A.createComponent("bogus:bogus",null,function(component, status){
                statusComplete = status;
                actionComplete = true;
                
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertEquals(statusComplete, "ERROR");
            });
        }
    },

    testReturnsActionStateForUnknownComponentType:{
        test:function(){
            var expected="ERROR";
            var actual=null;
            var actionComplete = false;

            $A.createComponent("bogus:bogus",null,function(component,state){
                actual=state;
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertEquals(expected,actual);
            });
        }
    },

    testReturnsActionErrorMessageForUnknownComponentType:{
        test:function(){
            var expected="No COMPONENT named markup://bogus:bogus found";
            var actual=null;
            var actionComplete = false;

            $A.createComponent("bogus:bogus",null,function(component,state, statusMessage){
                actual=statusMessage;
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertTrue(actual.indexOf(expected) != -1, "Received unexpected action status message: <"+actual+">");
            });
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
        test:[function(component){
            $A.test.assertUndefinedOrNull($A.componentService.getDef("ui:button",true));
            var actionComplete = false;

            $A.createComponents([
                ["ui:button",{label:1}],
                ["ui:button",{label:2}],
                ["ui:button",{label:3}],
                ["ui:button",{label:4}],
                ["ui:button",{label:5}]
            ],function(components){
                component.find("createdComponents").set("v.body",components);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }, function(component) {
            var expected="12345";
            var actual=$A.test.getTextByComponent(component.find("createdComponents"));

            $A.test.assertEqualsIgnoreWhitespace(expected, actual);
        }]
    },

    testOnlyCallsCallbackOnceWhenCreatingMultipleComponents:{
        test:function(){
            var expected=1;
            var actual=0;

            $A.createComponents([
                ["aura:text",{value:1}],
                ["aura:text",{value:2}],
                ["aura:text",{value:3}],
                ["aura:text",{value:4}],
                ["aura:text",{value:5}]
            ],function(){
                actual++;

                $A.test.assertEquals(expected, actual);
            })
        }
    },

    testPassesSUCCESSIfNoErrorsWhenCreatingMultipleComponents:{
        test:function(){
            var expected="SUCCESS";
            var actual;

            $A.createComponents([
                ["aura:text",{value:1}],
                ["aura:text",{value:2}],
                ["aura:text",{value:3}],
                ["aura:text",{value:4}],
                ["aura:text",{value:5}]
            ],function(components,overallStatus){
                actual=overallStatus;

                $A.test.assertEquals(expected, actual);
            })
        }
    },

    testPassesINCOMPLETEIfOneComponentTimesoutWhenCreatingMultipleComponents:{
        // TODO(W-2537764): IE < 10 gives Access Denied error when trying to send XHRs after setServerReachable(false)
        browsers: ["-IE7", "-IE8", "-IE9"],
        test:function(){
            var expected="INCOMPLETE";
            var actual;
            var actionComplete = false;
            $A.test.setServerReachable(false);

            $A.createComponents([
                ["aura:text",{value:1}],
                ["ui:button",{value:2}],
                ["aura:text",{value:3}],
                ["aura:text",{value:4}],
                ["aura:text",{value:5}]
            ],function(components,overallStatus){
                actual=overallStatus;
                $A.test.setServerReachable(true);
                actionComplete = true;
            });
            
            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertEquals(expected,actual);
            });
        }
    },

    testPassesERRORIfOneComponentErrorsWhenCreatingMultipleComponents:{
        test:function(){
            var expected="ERROR";
            var actual;
            var actionComplete = false;

            $A.createComponents([
                ["aura:text",{value:1}],
                ["ui:button",{label:2}],
                ["aura:text",{value:3}],
                ["bogus:bogus",{value:4}],
                ["aura:text",{value:5}]
            ],function(components,overallStatus){
                actual=overallStatus;
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertEquals(expected,actual);
            });
        }
    },

    testPassesStatusListWithDetailedInfoWhenCreatingMultipleComponents:{
        test:function(){
            var expected="SUCCESS,SUCCESS,SUCCESS,ERROR,SUCCESS";
            var actual;
            var actionComplete = false;

            $A.createComponents([
                ["aura:text",{value:1}],
                ["ui:button",{label:2}],
                ["aura:text",{value:3}],
                ["bogus:bogus",{value:4}],
                ["aura:text",{value:5}]
            ],function(components,overallStatus,statusList){
                actual=[];
                for(var i=0;i<statusList.length;i++){
                    actual.push(statusList[i].status);
                }
                actual=actual.join(',');
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertEquals(expected,actual);
            });
        }
    },

    testPassesActionErrorMessageWhenCreatingMultipleComponents:{
        test:function(){
            var expected="No COMPONENT named markup://bogus:bogus found";
            var actual;
            var actionComplete = false;

            $A.createComponents([
                ["aura:text",{value:1}],
                ["ui:button",{label:2}],
                ["aura:text",{value:3}],
                ["bogus:bogus",{value:4}],
                ["aura:text",{value:5}]
            ],function(components,overallStatus,statusList){
                actual=statusList[3].message
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertTrue(actual.indexOf(expected) != -1, "Received unexpected action status message: <"+actual+">");
            });
        }
    }
})
