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
	updateSize: function(cmp, width, height) {
		var width = width || cmp.get('v.priv_width'),
			height = cmp.get('v.priv_height');			
		
		var style = [width ? ('width:' + width + 'px;') : '', height ? ('height:' + height + 'px;') : ''].join('');

		if (style.length > 0) {
			cmp.getValue('v.priv_pageStyle').setValue(style);
		}
	},
	
	selectPage: function(cmp, evt) {		
		var selectedPage = evt.getParam('pageIndex'),
			curPage = cmp.get('v.pageIndex'),
			selectedItemCss = 'carousel-page-selected',
			hiddenCssClass = 'hidden',
			method = selectedPage == curPage ? 'addClass' : 'removeClass';

		$A.util[method](cmp.getElement(), selectedItemCss);
		
		cmp.getValue("v.priv_ariaExpanded").setValue(selectedPage == curPage);    	
	    
		if (selectedPage == curPage) {
			var isCacheable = cmp.get('v.isCacheable');
				parent = cmp.get('v.parent'),
				pageModel = cmp.get('v.pageModel');
				
			$A.util.removeClass(cmp.getElement(), hiddenCssClass);
							
			var e = parent[0].get('e.loadPage');    			
			e.setParams({pageModel: pageModel, pageIndex: curPage});    			
			e.fire();			
		} 
	},
	
	/**
	 * Update page content
	 */
	updatePage: function(cmp, evt) {
		var pageCmp = evt.getParam("pageComponent");
		if (pageCmp) {
			var pageContainer = cmp.find('pageContainer').getValue('v.body');
			if (!pageContainer.isEmpty()) {
				pageContainer.destroy();
	        }
			pageContainer.setValue(pageCmp);
		}
	},
	
	/**
	 * Set page is visible or not when displayed 
	 */
	setVisibility: function(cmp) {
		var isVisible = cmp.get('v.priv_visible'),
			strClass = cmp.get('v.class') || '';

		if (!isVisible) {			
			cmp.getValue('v.class').setValue(strClass + ' hidden');
		}
		
		if (cmp.get('v.priv_continuousFlow')) {
			cmp.getValue('v.priv_ariaExpanded').setValue(true);
		}
	},
	
	showPage: function(cmp, pageIndex) {
		var curPage = cmp.get('v.pageIndex'),			
			hiddenClass = 'hidden';
			
		if (pageIndex == curPage) {
			$A.util.removeClass(cmp.getElement(), hiddenClass);			
		}		
	},
	
	hidePage: function(cmp, pageIndex) {
		var curPage = cmp.get('v.pageIndex'),			
			hiddenClass = 'hidden';
		
		if (pageIndex == curPage) {			
			$A.util.addClass(cmp.getElement(), hiddenClass);
		}
	}
}