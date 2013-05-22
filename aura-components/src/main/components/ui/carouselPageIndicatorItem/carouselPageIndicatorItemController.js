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

{
	onInit: function(cmp, evt, helper) {
		var pageCmp = cmp.get('v.priv_pageComponent'),
			title;
		
		if (pageCmp && pageCmp.get('v.title')) {			
			title = pageCmp.get('v.title');			
		} else {				
			title = 'Page ' + cmp.get('v.pageIndex');			
		}
		
		cmp.getValue('v.title').setValue(title);
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
    		cmp.getValue("v.priv_ariaControlId").setValue(pageId);
    		cmp.getValue("v.priv_ariaSelected").setValue(true);
    		cmp.getValue("v.priv_tabIndex").setValue(0);
    		$A.util.addClass(cmp.getElement(), selectedItemCss);
    	} else {
    		cmp.getValue("v.priv_ariaControlId").setValue('');
    		cmp.getValue("v.priv_ariaSelected").setValue(false);
    		cmp.getValue("v.priv_tabIndex").setValue(-1);
    		$A.util.removeClass(cmp.getElement(), selectedItemCss);
    	}
    }
}