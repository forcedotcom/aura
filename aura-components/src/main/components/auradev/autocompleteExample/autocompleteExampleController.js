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
    handleInputChange: function(component, event, helper) {
        var keyword = event.getParam("value");
        var acCmp = component.find("autoComplete");
        if (acCmp) {
            // Fetch data if necessary
            // autocomplete component will automatically match text on the new data
            var fetchDataEvt = acCmp.get("e.fetchData");
            var index = 0;
            if (keyword.indexOf("MRU") >= 0) {
                index = 1;
            }
            var options = {};
            options.keyword = keyword;
            fetchDataEvt.setParams({
                parameters: options,
                index: index
            });
            fetchDataEvt.fire();            
            
            // If you want to match on the existing data
            /*
            var matchEvt = acCmp.get("e.matchText");
            matchEvt.setParams({
                keyword: keyword
            });
            matchEvt.fire();
            */
        }
    },
    
    handleMatchDone: function(component, event, helper) {
        console.log("There are " + event.getParam("size") + " matched options.");
    },
    
    handleSelectOption: function(component, event, helper) {
        var optionCmp = event.getParam("option");
    }
})
