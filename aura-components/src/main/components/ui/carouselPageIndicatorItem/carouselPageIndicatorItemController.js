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
	onInit: function(cmp, evt, helper) {
		var pageCmp = cmp.get('v.priv_pageComponent'),
			title = 'Page ' + cmp.get('v.pageIndex'), //TODO: localize
			label = title;

		if (pageCmp && pageCmp.get('v.pageModel')) {
			var pageModel = pageCmp.get('v.pageModel');

			title = pageModel.title || title;
			label = pageModel.label || label;

			if (pageModel.devNameOrId) {
				cmp.set("v.priv_id", "tab_" + pageModel.devNameOrId);
			}
		} else if (pageCmp) {
			title = pageCmp.get('v.title') || title;
		}

		cmp.set('v.title', title);
		cmp.set('v.label', label);
	},

	clickHandler: function (cmp, evt, helper) {
        var compEvent = cmp.getEvent("pagerClicked"),
        	pageIndex = cmp.get("v.pageIndex");

        compEvent.setParams({"pageIndex":  pageIndex});
        compEvent.fire();
    },

    keyHandler: function (cmp, evt, helper) {
        var compEvent = cmp.getEvent("pagerKeyed"),
        	pageIndex = cmp.get("v.pageIndex");

        compEvent.setParams({"pageIndex": pageIndex, "event": evt });
        compEvent.fire();
    },

    onPageSelected: function(cmp, evt, helper) {
		var selectedPage = evt.getParam('pageIndex'),
			pageId = evt.getParam('pageId'),
			curPage = cmp.get('v.pageIndex'),
			selectedItemCss = 'carousel-nav-item-selected';

    	if (selectedPage == curPage) {
    		cmp.set("v.priv_ariaControlId", pageId);
    		cmp.set("v.priv_ariaSelected", true);
    		cmp.set("v.priv_tabIndex", 0);
    		cmp.set("v.priv_selectedClass", selectedItemCss);
    		var itemEl = cmp.find('pageItem').getElement();
    		if (itemEl) {
    			itemEl.focus();
    		}
    	} else {
    		cmp.set("v.priv_ariaControlId", '');
    		cmp.set("v.priv_ariaSelected", false);
    		cmp.set("v.priv_tabIndex", -1);
    		cmp.set("v.priv_selectedClass", "");
    	}
    }
})
