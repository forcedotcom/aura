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
    testSystemErrorEventRegistration: {
        test: function(component){

            var event = component.getEvent("press");
            aura.test.assertTrue(event.getSource().toString().indexOf("test:test_ErrorMsg_CompositeCmp")!=-1,"Source of the event is incorrect");

            /*for (var i = 0; i < component.priv.children.length; i++) {
             var cmp = component.priv.children[i];
             var subCmpEvent = cmp.getEvent("systemError");
             aura.test.assertTrue(subCmpEvent!==null, "Every sub-component should be automatically registered with systemError event");
            }
            */
            //Verify handlers for this systemError event
            var handlerDefs = component.getDef().getAppHandlerDefs();
            aura.test.assertTrue(handlerDefs.length===1,"Component has more than 1 handlers");
            if(handlerDefs[0].eventDef.getDescriptor().getQualifiedName()==='markup://aura:systemError'){
                     aura.test.assertTrue(handlerDefs[0].action.path.join()==="c,outerSystemError",
                                            "Incorrect action registered for location change handler");
            }else{
                     aura.test.fail("Unkown action/handler registered with component");
                 }
            }
    }
})
