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
    afterRender: function (cmp, helper) {
        this.superAfterRender();
        var dom = cmp.getElement();
        var scrollables = dom.querySelectorAll('.scrollable');
        for (var i = 0; i < scrollables.length; i++) {
            helper.lib.panelLibCore.scopeScroll(scrollables[i]);
        }
    },
    rerender: function (cmp, helper) {
    	var currentEl =cmp.getElement();
    	var classes = [];

    	// The things that set these classes
    	// are async so there is a race condition 
    	// at re-render time causing these to be erased.
    	// There is probably a better way, but this works for now
    	if(currentEl.className.match(/(\s|^)open(\s|$)/)) {
    		classes.push('open');
    	}
    	if(currentEl.className.match(/(\s|^)active(\s|$)/)) {
    		classes.push('active');
    	}

    	vClass = cmp.get('v.class');
    	if(vClass) {
    		classes.push(vClass);
    	}
    	cmp.set('v.class', classes.join(' '));
    	this.superRerender();

    }
})