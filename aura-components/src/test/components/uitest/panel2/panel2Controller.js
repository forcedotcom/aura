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
        var callback = event.getParam && event.getParam('arguments').callback;
        helper.show(cmp, callback);
    },
    
    hide: function (cmp, event, helper) {
        var callback = event.getParam && event.getParam('arguments').callback;
        helper.hide(cmp, callback);
    },
    
    close: function (cmp, event, helper) {
        var callback = event.getParam && event.getParam('arguments').callback;
    	helper.close(cmp, callback);
    },
    /**
     * This method is called when other panels are created or destroyed
     * @param cmp
     * @param event
     * @param helper
     */
    setActive: function(cmp, event, helper) {
        var active = event.getParam && event.getParam('arguments').active;
        helper.setActive(cmp, active);
    },
    handleNotify: function (cmp, event, helper) {
        helper.notify(cmp, event);

    }
})
