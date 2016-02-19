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
		helper.initializeHandlers(cmp);
        if (!cmp.get('v.name')) {
            cmp.set('v.name', cmp.get('v.title'));
        }
	},
	addHandler: function (cmp, event, helper) {
        var params = event.getParam('arguments');
        helper.addHandler(cmp, params);
    },
    /**
     * Handler for event that's fired programatically
     */
    setActive: function(cmp, evt, helper) {
        var params = evt.getParam('arguments');
        helper.setActive(cmp, params.active, params.focus);
    },
    press: function(cmp) {
        if($A.util.getBooleanValue("v.active")) {
            cmp.get('e.onActivate').fire();
        }
    },

    close: function(cmp, evt) {
        cmp.get("e.onClose").fire();
        $A.util.squash(evt, true);
    },

    onTabHover: function(cmp, evt, helper) {
        helper.handleHoverEvent(cmp, 'onTabHover');
    },

    onTabUnhover: function(cmp, evt, helper) {
        helper.handleHoverEvent(cmp, 'onTabUnhover');
    }
})// eslint-disable-line semi
