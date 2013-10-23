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
    refresh: function(component, event, helper) {
        helper.refresh(component);
    },
    
    locationChange: function(component, event) {
		var scroller = component._scroller;
		if (!$A.util.isUndefined(scroller)) {
			scroller.unbindTransientHandlers();
		}    	
    },
    
    scrollTo: function(component, event, helper) {
    	helper.handleScrollTo(component, event);
    },
    
    scrollBy: function(component, event, helper) {
    	helper.handleScrollBy(component, event);
    },
    
    handleCanShowMoreChange: function (cmp, evt, hlp) {
    	var newValue = evt.getParam('value').getValue(),
    		oldValue = cmp.getValue('v.canShowMore').oldValue;
    	
    	cmp._canShowMore = newValue; 
    	
    	// false => true ?
    	if (!oldValue && newValue) {
    		hlp.swapShowMore(cmp);	
    	}
    }
})
