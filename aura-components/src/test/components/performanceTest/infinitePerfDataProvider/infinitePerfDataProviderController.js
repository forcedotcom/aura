/*
 * Copyright (C) 2014 salesforce.com, inc.
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
    provide: function(component, event, helper){
    	component = component.getConcreteComponent();
    	var isGetDataFromServer = component.get("v.getDataFromServer");
    	var listType = component.get("v.listType")
    	var currentPage = component.get("v.currentPage");
	var multiplier = component.get("v.multiplier");
        var pageSize = component.get("v.pageSize") * multiplier;
        var start = (currentPage - 1) * pageSize;
	var limit = start+pageSize;
        var data = [];
        
        if (listType === "single") {
        	limit = start+1;
        }
        
        if (isGetDataFromServer) {
        	var action = component.get("c.getList");
        	
        	action.setParams({
        		"start" : start,
        		"limit" : limit
        	});
        	
        	action.setCallback(this, function(action) {
        		if (action.getState() === "SUCCESS") {
        			data = action.getReturnValue();
        			helper.fireDataChangeEvent(component, data);
        		}
        	});
        	$A.enqueueAction(action);
        } else {
        	for (var i=start; i<limit; i++) {
        		data.push({
        			index: i+1,
        			char: String.fromCharCode(65 + (i%26))
        		});
        	}
        
	        // TODO: figure out why this server hit is necessary to get the parent scroller to refresh...
	        
	        var action = component.get("c.dummy");
	    	action.setCallback(this, function(action) {
				// we don't actually care--we just want the server action lifecycle to fire so the scroller will refresh...
			    
	        	helper.fireDataChangeEvent(component, data); 
	    	});
	    	this.runAfter(action);
	    	
			// this should be all that's needed...        
	        //helper.fireDataChangeEvent(component, data);
    	}
    }
})