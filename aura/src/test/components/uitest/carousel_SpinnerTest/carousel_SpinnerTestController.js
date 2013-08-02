/*
 * Copyright (C) 2013 salesforce.com, inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
{
	loadPage : function(cmp, evt, helper) {
		helper.showLoadingIndicator(cmp.getSuper());
		
		var doLoadPage = function() {
			var curPage = cmp.get('v.priv_currentPage');
	    	var pages = helper.getPageComponents(cmp);
	    	
	    	if (curPage > 0 && curPage <= pages.length) {
		    	var e = cmp.get('e.loadPage'),
		    		pageCmp = helper.getPageComponentFromIndex(cmp, curPage),
		    		pageModel = helper.getPageModelFromIndex(cmp, curPage);
		    	
				e.setParams({pageModel: pageModel, pageComponent: pageCmp, pageIndex: curPage});    			
				e.fire();
			}
	    	
	    	helper.hideLoadingIndicator(cmp.getSuper());
		}
		
		setTimeout(doLoadPage, 3000);
	}
}