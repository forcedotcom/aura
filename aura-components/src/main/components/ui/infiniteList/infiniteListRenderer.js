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
	afterRender: function (cmp, hlp) {
		var list;
		
		if (cmp.get('v.enableRowSwipe')) {
			hlp.initializeHandlers(cmp);
			list = cmp.getElement();
		
			// Just attach the start handler, move and end is conditionally added.
			// Attached to the capture phase in order to cancel click events if necessary. 
			// This is necessary because Aura's FastClick implementation is attached directly
			// to aura:html components instead of at the window level.
			list.addEventListener(hlp.getEventNames().start, cmp._ontouchstart, true); 
			
			list.addEventListener('InfiniteListRowOpen', cmp._onInfiniteListRowOpen, false);
			list.addEventListener('InfiniteListRowClose', cmp._onInfiniteListRowClose, false);
		}
		
        this.superAfterRender();
	}
})