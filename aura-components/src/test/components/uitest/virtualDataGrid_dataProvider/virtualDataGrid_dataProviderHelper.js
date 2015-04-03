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
    provide: function(component, event, controller) {
        var sortBy = component.get("v.sortBy");
        var pageSize = component.get("v.pageSize");
    	var data = component.get("m.items");
    	var helper = this;
    	data.sort(helper.compare(sortBy));
        var dataProvider = component.getConcreteComponent();
        this.fireDataChangeEvent(dataProvider, data);
    },
    
    compare: function(sortBy) {
    	if (sortBy.indexOf("id") >=0 || sortBy.indexOf("age") >= 0) {
    		return function(item1, item2) {
        		if (sortBy.startsWith("-")) {
        			return -1 * (item1[sortBy.substring(1)] - item2[sortBy.substring(1)]);
        		} else {
        			return item1[sortBy] - item2[sortBy]; 
        		}
        	}
    	} else {
    	    return function(item1, item2) {
    		    if (sortBy.startsWith("-")) {
    			    return -1 * (item1[sortBy.substring(1)].localeCompare(item2[sortBy.substring(1)]));
    		    } else {
    			    return item1[sortBy].localeCompare(item2[sortBy]); 
    		    }
    	    }
    	}
    }
})