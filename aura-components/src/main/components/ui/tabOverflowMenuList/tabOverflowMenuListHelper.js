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
	 * Overrides for keyboard interactions
	 */
	setFocusToNextItem: function(component, event) {
        var nextIndex = 0;
        var srcComponent = this.getComponentForElement(event.target || event.srcElement);
        var menuItems = component.get("v.childMenuItems");
        for (var i = 0; i < menuItems.length; i++) {
            if (srcComponent === menuItems[i]) {
                nextIndex = ++i;
                break;
            }
        }
        // Collapse the menu and let the parent component handle the forward wrap.
        if (nextIndex >= menuItems.length) {
            component.get("e.forwardWrap").fire();
            component.get("e.doClose").fire();
            return;
        }
        var nextFocusCmp = menuItems[nextIndex];
        var action = nextFocusCmp.get("c.setFocus");
        action.runDeprecated();
        
        this.fireMenuFocusChangeEvent(component, srcComponent, nextFocusCmp);
    },
	
    /**
	 * Overrides for keyboard interactions
	 */
	setFocusToPreviousItem: function(component, event) {
        var previousIndex = 0;
        var srcComponent = this.getComponentForElement(event.target || event.srcElement);
        var menuItems = component.get("v.childMenuItems");
        for (var i = 0; i < menuItems.length; i++) {
            if (srcComponent === menuItems[i]) {
                previousIndex = --i;
                break;
            }
        }
        // Collapse the menu and let the parent component handle the reverse wrap.
        if (previousIndex < 0) {
            component.get("e.reverseWrap").fire();
            component.get("e.doClose").fire();
            return;
        }
        var previousFocusCmp = menuItems[previousIndex];
        var action = previousFocusCmp.get("c.setFocus");
        action.runDeprecated();
        
        this.fireMenuFocusChangeEvent(component, srcComponent, previousFocusCmp);
    }
})// eslint-disable-line semi