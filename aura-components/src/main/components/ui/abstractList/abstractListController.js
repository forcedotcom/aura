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
        
        component.getValue("v.currentPage").setValue(currentPage, true);
        component.getValue("v.pageSize").setValue(pageSize);
        
        helper.triggerDataProvider(component);
    },
    
    handleDataChange: function(component, event, helper) {
    	component = component.getConcreteComponent();
    	helper = component.getDef().getHelper();

    	if (component._refreshing) {
    		component.getConcreteComponent().getValue("v.items").clear();
    		
    		component._refreshing = false;
    	}
    	
    	helper.handleDataChange(component, event);
    },
    
    init: function(component, event, helper) {
        helper.init(component);
        
        helper.triggerDataProvider(component);
    },
    
    refresh: function(component, event, helper) {
    	component.getConcreteComponent().getValue("v.currentPage").setValue(1, true);
    	
    	component.getConcreteComponent()._refreshing = true;
    	
    	helper.triggerDataProvider(component);
    },
    
    triggerDataProvider: function(component, event, helper) {
    	helper.triggerDataProvider(component);
    }
})