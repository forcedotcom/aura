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
{
    clientAction: function(cmp, event){
        //Smaller components can set history tokens only when they are independent
        if(cmp===$A.getRoot()){
            //Client Action associated with the button
            //Get the current token, if this is the first time the page was loaded, token will be null
            var num = $A.historyService.get().num;
            //Increment the value of num
            if(num){
                $A.historyService.set("ButtonClickedSimpleComponent?num="+((num*1)+1));
            }else{
                $A.historyService.set("ButtonClickedSimpleComponent?num=1");
            }
        }else{
            //Get the current token, if this is the first time the page was loaded, token will be null
            var locator = $A.historyService.get().locator;
            //Increment the value of num
            if(locator){
                $A.historyService.set("ButtonClickedSimpleComponent?locator="+((locator*1)+1));
            }else{
                $A.historyService.set("ButtonClickedSimpleComponent?locator=1");
            }
        }
    },
    locationChange: function(cmp, event){
        //Action associated with the handler for the location change event specified for this component-> test:test_LocChng_Event
        if(event.getParam('num')){
            //Since location change event is triggered on page load and we dont want to change the button name until it is clicked
            //Change the button once clientAction() is invoked. clientAction() sets the location (URL) to ButtonClickedSimpleComponent?num=1
            var button = cmp.find("button");
            if(button){
                button.getAttributes().setValue('label','test_LocChng_SimpleComponent#test:test_LocChng_Event');
            }
        }
    },
    locationChangeComposite: function(cmp, event){
    //Action associated with the handler for the location change event specified for composite component-> test:test_LocChng_Event2
        if(event.getParam('locator')){
            //The 'locator' is defined for test:test_LocChng_Event2
            var button = cmp.find("button");
            if(button){
                button.getAttributes().setValue('label','test_LocChng_SimpleComponent#test:test_LocChng_Event2');
            }
        }
    },
    locationChangeGeneric: function(cmp, event){
    //Action associated with the generic aura:locationChange event. This should never be called
        if(event.getParam('num')){
            var button = cmp.find("button");
            if(button){
                button.getAttributes().setValue('label','test_LocChng_SimpleComponent#aura:locationChange');
            }
        }
    }


}
