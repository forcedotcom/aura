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
    /*Basic test to verify that a specified Event to be fired for Location Change is available in the component def.
     * */
    testDefinedLocationChangeEvent:{
        test : function(component){
            var event = component.getDef().getLocationChangeEvent();
            //Verify the event associated with Location change
            aura.test.assertTrue(event!==null, "Every component should be automatically registered to fire locationChange event");
            aura.test.assertEquals('markup://test:test_LocChng_Event2',event, "The compositeComponent has registered test:test_LocChng_Event2 for location change.");

            //Verify handlers for this location change event
            var handlerDefs = component.getDef().getAppHandlerDefs();
            aura.test.assertTrue(handlerDefs.length===1,"Component has more than 1 handlers");
            for(var i=0;i<handlerDefs.length;i++){
                 if(handlerDefs[i].eventDef.getDescriptor().getQualifiedName()==='markup://test:test_LocChng_Event2'){
                     aura.test.assertTrue((handlerDefs[i].action.path.join(".")==="c.clicked"),
                                            "Incorrect action registered for location change handler");
                 }/*else if(handlerDefs[i].eventDef.getDescriptor().getQualifiedName()==='test:test_LocChng_Event'){
                     aura.test.assertTrue(handlerDefs[i].action==="{!c.clicked}", "Incorrect action registered for location change handler");
                 }*/else{
                     aura.test.fail("Unkown action/handler registered with component");
                 }
            }
        }
    }

})
