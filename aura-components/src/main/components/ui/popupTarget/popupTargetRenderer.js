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
    afterRender: function(component, helper) {
    	var ret;
    	
        helper.setAriaAttributes(component);
        
        ret = this.superAfterRender();
        
        helper.position(component);

        return ret;
    },
    
    /*
     * rerender gets called when a property changes. So, we can rely on this method
     * to handle the visibility of the target when its visible attribute changes. This
     * is similar to attaching a change event to v.visible except that it works in instances
     * when this component is extended.
     */
    rerender: function(component, helper) {
        var ret = this.superRerender();

        helper.onVisibleChange(component);
        helper.setAriaAttributes(component);
        helper.position(component);
        
        return ret;
    },
    
    unrender: function(component, helper) {
    	if (component._localElementCache) {
    		// reset the element cache so that if component is rerendered it has a chance to refresh any changes
    		// also, using undefined instead of delete as delete is really slow and undefined suffices in this scenario
    		component._localElementCache = undefined;
    	}
    	
        helper.removeDismissEvents(component);
        this.superUnrender();
    }
})