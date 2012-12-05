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
    clientAction: function(cmp, event){
        //Client Action associated with the button
        //Get the current token, if this is the first time the page was loaded, token will be null
        var locator = $A.historyService.get().locator;
        //Increment the value of num
        if(locator){
            $A.historyService.set("ButtonClickedCompositeComponent?locator="+((locator*1)+1));
        }else{
            $A.historyService.set("ButtonClickedCompositeComponent?locator=1");
        }
    },

    clicked: function(cmp, event){
        //Action associated with handler for location change event(test:test_LocChng_Event2) in this component
        if(event.getParam('locator')){
            //Since location change event is triggered on page load and we dont want to change the button name until it is clicked
            //Change the button once clientAction() is invoked. clientAction() sets the location (URL) to ButtonClickedSimpleComponent?locator=1
            var button = cmp.find("compositeButton");
            if(button){
                button.getAttributes().setValue('label','test_LocChng_Composite:test:test_LocChng_Event2');
            }
        }
    },
    innerClicked: function(cmp, event){
        //Action associated with handler for location change event(test:test_LocChng_Event) in inner simple component
        if(event.getParam('num')){ //Since location change event is triggered on page load and we dont want to change the button name until it is clicked
            //Change the button once clientAction() is invoked. clientAction() sets the location (URL) to ButtonClickedSimpleComponent?num=1
            var button = cmp.find("compositeButton");
            if(button){
                button.getAttributes().setValue('label','test_LocChng_Composite:test:test_LocChng_Event');
            }
        }
    }
})
