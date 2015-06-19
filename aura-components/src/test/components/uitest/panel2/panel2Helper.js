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
	init: function(cmp, event) {
		
	},
	
	hide: function (cmp, callback) {
        cmp.set('v.visible', false);
        callback && callback(); // we may have animations
    },

    show: function (cmp, callback) {
        //need to notify panel manager to de-activate other panels;
        cmp.getEvent('notify').setParams({
            action: 'deActivatePanels',
            typeOf: 'ui:showPanel',
            payload: { panelInstance: cmp.getGlobalId() }
        }).fire();

        cmp.set('v.visible', true);
        this.setActive(cmp, true);

        callback && callback(); // we may have animations
	},
	update: function (cmp, callback) {
        callback && callback();
    },
    close: function (cmp, callback) {
        cmp.hide(function (t) {
            cmp.getEvent('notify').setParams({
                action: 'destroyPanel',
                typeOf: 'ui:destroyPanel',
                payload: { panelInstance: cmp.getGlobalId() }
            }).fire();
        });
    },
    notify: function (cmp, event) {
    	event.setParam('currentTarget', cmp.getGlobalId());
    },
    setActive: function(cmp, active) {
        //this will rerender, but it's ok for testing purpose
        cmp.set('v.active', active);
        //ignore accessibility as this is a test panel
    }
})
