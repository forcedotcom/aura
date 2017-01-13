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
    updateEventList: function (cmp, evt) {
        var eventList = cmp.get("v.eventList");

        // update last event fired
        evt.type = evt.getName();
        cmp.set("v.eventFired", evt);

        // clean event list if it gets too long        
        if (eventList.length >= cmp.get("v.eventListLen")) {
            eventList = [];
        }

        // add the event to the event list
        eventList.push(evt);
        cmp.set("v.eventList", eventList);
    },
    init: function (cmp) {
        if (cmp.get("v.testInputCmp") !== "none") {
            var supportedEvts = [
                "change"   , "input" ,
                "focus"    , "blur"  ,
                "copy"     , "paste" ,
                "keydown"  , "keyup" ,
                "keypress"
            ];
            var inputCmp = cmp.find("input");
            if(cmp.get("v.setValueToZeroDuringInit")){
            	inputCmp.set("v.value",0);
            }
            supportedEvts.forEach(function (evt) {
                inputCmp.addHandler(evt, cmp, "c.updateEventList");
            });
        }
    },
    toggleDisabled: function (cmp) {
        var disabled = cmp.get("v.disabled");
        cmp.set("v.disabled", !disabled);
    },
    setValue: function (cmp) {
        var inputCmpVal = cmp.find("input").get("v.value");
        cmp.set("v.value", inputCmpVal);
    },
    clearEvents: function (cmp) {
        cmp.set("v.eventFired", "");
        cmp.set("v.eventList", []);
    }
})
