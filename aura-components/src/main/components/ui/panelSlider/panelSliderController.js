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
	init: function (cmp, event, helper) {
		helper.init(cmp, event);
	},
    show: function (cmp, event, helper) {
        helper.show(cmp, event);
    },
    
    hide: function (cmp, event, helper) {
        helper.hide(cmp, event);
    },
    toggleVisibility: function (cmp, event, helper) {
    	helper.toggleVisibility(cmp, event);
    },
    
    slideIn: function (cmp, event, helper) {
    	helper.slideIn(cmp, event);
    },
    slideOut: function (cmp, event, helper) {
    	helper.slideOut(cmp, event);
    },
    
    toggleSlide: function (cmp, event, helper) {
    	helper.toggleSlide(cmp, event);
    },

    _onWrapperClick: function (cmp, event, helper) {
        if (!cmp.get('v.isModal') || !cmp.get('v.closeOnModalClick')) {
            return;
        }

    	var panel    = cmp.getElement(),
    		wrapper  = cmp.find('panel').getElement(),
    		body     = cmp.find('body').getElement(),
    		glass    = cmp.find('modal-glass').getElement(),
    		inTarget = event.target === body || event.target === wrapper || event.target === glass;

    	if (inTarget) {
    		helper.slideOut(cmp, event);
    	}
    }
    
})
