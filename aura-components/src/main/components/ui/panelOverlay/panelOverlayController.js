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
    onVisibleChange: function(cmp, event, helper) {
    },
    
	show: function (cmp, event, helper) {
        helper.show(cmp, event);
    },
    
    hide: function (cmp, event, helper) {
        helper.hide(cmp, event);
    },
    
    close: function (cmp, event, helper) {
    	helper.close(cmp, event);
    },
    
    toggleHeaderPosition : function(cmp, event, helper) {
    	var inFocus = event.getParam('inFocus');
    	helper.setHeaderPosition(cmp, event, inFocus);
    },
    
    update: function(cmp, payload, helper) {
    	helper.update(cmp, payload);
    }
})
