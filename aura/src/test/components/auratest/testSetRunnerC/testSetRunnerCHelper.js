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
    raisePollEvent : function (cmp, freq){
           var event = aura.get("e.auratest:poll");
            setTimeout(function(){
                event.fire();

            }, freq);
    },
    
    updateDisplay: function(cmp, helper){    
     cmp.getValue("m.testsWithProps").each(function(map){
	 	if(helper.searchFilter(cmp, map) && helper.failedFilter(cmp, map) && helper.integrationFilter(cmp, map)){
	 		map.getValue("isHidden").setValue("");
	 	}
	 	else{
	 		map.getValue("isHidden").setValue("HIDDEN");
	 	}	     
     });
    },
    
    searchFilter: function(cmp, propMap){
    	var searchText = cmp.find("searchText").get("v.value");
    	return $A.util.isUndefinedOrNull(searchText) || propMap.get("name").toLowerCase().indexOf(searchText.toLowerCase()) != -1;  
    },
    
    failedFilter: function(cmp, propMap){
    	var isShowOnlyFailedTests =  cmp.find("showFailedTests").getValue("v.value").getBooleanValue();
    	var status = propMap.get("status");
    	return !isShowOnlyFailedTests || status === "FAILED";
    },
    integrationFilter: function(cmp, propMap){
    	var isShowOnlyIntegrationTests =  cmp.find("showOnlyIntegrationTests").getValue("v.value").getBooleanValue();
    	var isIntegration = propMap.get("isInteg");
    	return !isShowOnlyIntegrationTests || isIntegration;
    }    
})
