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
	onPageSelected : function (cmp, evt, helper) {		
		var selectedPage = evt.getParam('pageIndex'),
			curPage = cmp.get('v.pageIndex'),
			selectedItemCss = 'carousel-page-selected',		
			method = selectedPage == curPage ? 'addClass' : 'removeClass';

		$A.util[method](cmp.getElement(), selectedItemCss);
		
    	cmp.getValue("v.priv_ariaExpanded").setValue(selectedPage == curPage);    	
	    
    	if (selectedPage == curPage) {
    		var isCacheable = cmp.get('v.isCacheable');
				parent = cmp.get('v.parent'),
				pageModel = cmp.get('v.pageModel');
				
    		if (true) {
    			var e = parent[0].get('e.loadPage');    			
    			e.setParams({pageModel: pageModel, pageIndex: curPage});    			
    			e.fire();
    		}
    	}	
	},
	
	onPageUpdate: function(cmp, evt, helper) {		
		var pageCmp = evt.getParam("pageComponent");
		if (pageCmp) {
			var pageContainer = cmp.find('pageContainer').getValue('v.body');
			if (!pageContainer.isEmpty()) {
				pageContainer.destroy();
	        }
			pageContainer.setValue(pageCmp);
		}
	}
}