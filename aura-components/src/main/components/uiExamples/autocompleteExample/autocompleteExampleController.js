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
    handleMatch: function(cmp, event) {
    },
    
    handleInput: function(cmp, event) {
    	var acCmp = event.source;
        if (acCmp) {
            var matchEvt = acCmp.get("e.matchText");
            matchEvt.setParams({
                keyword: event.getParam("value")
            });
            matchEvt.fire();
        }
    },
    
    handleSelection: function(cmp, event) {
    	var sourceId = event.source.getLocalId();
    	cmp.set("v." + sourceId + "Value", event.getParam("option").get("v.value"));
    },
    
    changeClasses: function(cmp) {
    	cmp.set("v.classes", !$A.util.getBooleanValue(cmp.get("v.classes")));
    }
})