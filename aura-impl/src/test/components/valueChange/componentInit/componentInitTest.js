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
    /**
     * verify aura:valueInit event fired when component initialized.
     */
    testInitEventFired:{
        test:function(cmp){
            $A.test.assertTrue(cmp._testCmpInitFlag, "Component initialization did not fire an event.");
            $A.test.assertTrue(cmp._testCmpInitMultipleFlag, "Component initialization did not invoke second handler for init.");


            $A.test.assertTruthy(cmp._testCmpInitEvt);
            $A.test.assertEquals("markup://aura:valueInit", cmp._testCmpInitEvt.getDef().getDescriptor().getQualifiedName(),
                    "Expected aura:valueInit to trigger component init");

            var value = cmp._testCmpInitEvt.getParam("value");
            $A.test.assertEquals("Component", value.auraType);
            //Verify that value parameter of event is the current component
            $A.test.assertEquals(cmp, value, "aura:valueInit was expected to provider current component as 'value' param.");
        }
    },
    /**
     * Verify aura:valueInit not fired when attributes are initialized
     */
    testInitEventNotFiredForAttributeValues:{
        test:function(cmp){
            $A.test.assertFalsy(cmp._testAttrInitFlag, "Attribute initialization should not have fired an init event.");
        }
    },
    /**
     * Verify aura:valueInit fired when facets are initialized
     */
    testInitEventOnFacetInitialization:{
        test:function(cmp){
            var facet= cmp.find('facet');
            $A.test.assertTrue(facet._testFacetCmpInitFlag, "Facet initialization did not fire an event.")

            $A.test.assertTruthy(facet._testFacetCmpInitEvt);
            $A.test.assertEquals("markup://aura:valueInit", facet._testFacetCmpInitEvt.getDef().getDescriptor().getQualifiedName(),
                    "Expected aura:valueInit to trigger facet component init");

            var value = facet._testFacetCmpInitEvt.getParam("value");
            $A.test.assertEquals("Component", value.auraType);
            //Verify that value parameter of event is the facet component
            $A.test.assertEquals(facet, value, "aura:valueInit was expected to provider facet as 'value' param.");
        }
    },
    /**
     * Verify that handlers can be attached to init event by specifying aura:id of facets
     */
    //W-1318112
    _testAttachedInitHandlerByFacetId:{
        test:function(cmp){
            //Verify that facet was initialized
            $A.test.assertTrue(cmp.find('facet')._testFacetCmpInitFlag, "Facet initialization wasn't successful.")
            //Verify that the handler attached by outer component was invoked.
            $A.test.assertTruthy(cmp._testFacetFlag, "Failed to attached init handler by specifying aura:id of facet.");
            $A.test.assertTrue(cmp._testFacetFlag);
        }
    },
    /**
     * Verify that aura:valueInit is fired when new components are created client side.
     */
    testNewComponentFiresInit:{
        test:function(cmp){
            cmp.getValue("v.body").push($A.componentService.newComponentDeprecated({componentDef:"markup://valueChange:newComponentInit"}
                                                                        ));
            $A.services.event.finishFiring();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
            "Expected component to be initially represented by a placeholder.");

            //Wait till all specified facets marked with aura:load are replaced by actual components, and then call callbackAfterLoad()
            this.assertAfterLazyLoading(body[0],"markup://valueChange:newComponentInit",
                    function(){
                        var newCmp = this.extractCmpFromPlaceholder(body[0],"markup://valueChange:newComponentInit");
                        $A.test.assertTrue(newCmp._testNewCmpInitFlag);
                        $A.test.assertTruthy(newCmp._testNewCmpInitEvt);
                        var value = newCmp._testNewCmpInitEvt.getParam("value");
                        $A.test.assertEquals("Component", value.auraType);
                        //Verify that value parameter of event is the new component that was just created.
                        $A.test.assertEquals(newCmp, value, "aura:valueInit was expected to provider current component as 'value' param.");
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
        		if(body[key].auraType && body[key].auraType === 'Component' && body[key].getDef().getDescriptor().getQualifiedName()===cmpName){
                    ret= body[key];
            	}
        	}         
        }
        
        return ret;
    }
})
