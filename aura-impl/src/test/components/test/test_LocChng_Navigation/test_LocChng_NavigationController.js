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
    clientAction: function(cmp, event){
        cmp.set('v.locationChangeIndicator', 'start');
        //Client Action associated with the button
        //Get the current token, if this is the first time the page was loaded, token will be null
        var num = $A.historyService.get().num;
        //Increment the value of num
        if(num){
            $A.historyService.set("ButtonClicked?num=" + (Number(num) + 1));
        }else{
            $A.historyService.set("ButtonClicked?num=1");
        }
    },
    locationChange: function(cmp, event){
        var buttonTextIndex;
        //Action associated with the handler for the location change event specified for this component-> test:test_LocChng_Event
        if(event.getParam('num')){
            //Find the output on the page where the current state will be displayed
            var displayText = cmp.find("display");
            if(displayText){
                    displayText.set('v.value',event.getParam('num'));
                    $A.rerender(displayText);
            }
        }
        cmp.set('v.locationChangeIndicator', 'complete');
    },
    next:function(cmp){
        cmp.set('v.locationChangeIndicator', 'start');
        $A.historyService.forward();
    },
    back:function(cmp){
        cmp.set('v.locationChangeIndicator', 'start');
        $A.historyService.back();
    }
})
