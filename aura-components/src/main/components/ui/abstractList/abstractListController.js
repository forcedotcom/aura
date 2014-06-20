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
    /**
     * TODO::make pagination work with more than one data provider.
     *
     */
    handlePageChange: function(component, event, helper) {
        var currentPage = event.getParam("currentPage");
        var pageSize = event.getParam("pageSize");

        component.set("v.currentPage", currentPage, true);
        component.set("v.pageSize", pageSize);

        helper.triggerDataProvider(component);
    },

    handleDataChange: function(component, event, helper) {
    	var concrete = component.getConcreteComponent(),
    		concreteHelper = concrete.getDef().getHelper(),
    		callback;
    	    	
    	if (concrete._refreshing) {
    		helper.beforeRefresh(concrete, event);
    		concrete._refreshing = false;
    		callback = concrete._callback;
    	}

    	concreteHelper.handleDataChange(component, event, callback);
    	concrete._callback = null; // remove reference to avoid a leak
    },

    init: function(component, event, helper) {
        helper.init(component);
        helper.initTriggerDataProviders(component);
    },

    // TODO: Support refresh-all behavior
    refresh: function(component, event, helper) {
    	var concrete = component.getConcreteComponent(),
    		params = event.getParam("parameters"),
    		index = 0;
    	
    	if (params) {
    		index = params.index;
    		concrete._callback = params.callback;
    	}

    	concrete.set("v.currentPage", 1, true);
    	concrete._refreshing = true;
        	
    	helper.triggerDataProvider(component, index);
    },

    triggerDataProvider: function(component, event, helper) {
    	var params = event.getParam("parameters");
    	var index = 0;
    	if (params) {
    		index = params.index;
    	}
    	helper.triggerDataProvider(component, index);
    }
})