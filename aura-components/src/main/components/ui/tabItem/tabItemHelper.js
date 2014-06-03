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
	setActive: function(cmp, active, focus) {
		var containerEl = cmp.find("li").getElement(),
			itemEl = cmp.find("tabItem").getElement(),
			closeEl = cmp.find("close").getElement();
		
		cmp._isActive = active;
		
		if (active) {			
			$A.util.addClass(containerEl, "active");
			itemEl.setAttribute("aria-selected", true);
			itemEl.setAttribute("tabindex", 0);
			if (closeEl) {
			    closeEl.setAttribute("tabindex", 0);
			}
			if (focus) {
			    itemEl.focus();
			}
		} else {
			$A.util.removeClass(containerEl, "active");
			itemEl.setAttribute("aria-selected", false);
			itemEl.setAttribute("tabindex", -1);
			if (closeEl) {
                closeEl.setAttribute("tabindex", -1);
            }
		}
	}
})