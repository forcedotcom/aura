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
    testLocationChangeEventIsDefined:{
        test : function(component){
            //Verify the event registered for Location Change
            var event = component.getDef().getLocationChangeEvent();
            aura.test.assertTrue(event!==null, "Every component should be automatically registered to fire locationChange event");
            aura.test.assertEquals('markup://test:test_LocChng_Event',event, "The simpleComponent has registered test:test_LocChng_Event for location change.");

            //Verify the actions associated with
            var handlerDefs = component.getDef().getAppHandlerDefs();
            aura.test.assertTrue(handlerDefs.length===3);
            for(var i=0;i<handlerDefs.length;i++){
                var qname = handlerDefs[i].eventDef.getDescriptor().getQualifiedName();
                var action = handlerDefs[i].action.path.join(".");

                 if(qname==='markup://test:test_LocChng_Event'){
                     aura.test.assertTrue(action==="c.locationChange",
                             "Incorrect action registered for location change handler");
                 }else if(qname==='markup://test:test_LocChng_Event2'){
                     aura.test.assertTrue(action==="c.locationChangeComposite",
                             "Incorrect action registered for location change handler");
                 }else if (qname==='markup://aura:locationChange'){
                     aura.test.assertTrue(action==="c.locationChangeGeneric",
                             "Incorrect action registered for location change handler");
                 }else{
                     aura.test.fail("Unknown handler/action registered");
                 }

            }
        }
    }

})
