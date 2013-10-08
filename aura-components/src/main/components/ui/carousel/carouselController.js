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
	onInit : function(cmp, evt, helper) {
		helper.init(cmp);
	},
	
	onPageComponentsChanged: function(cmp, evt, helper) {		
    	helper.initPages(cmp); 
    },
    
    /**
     * Handle scrollStart event coming from scroller
     */
    onScrollMove : function(cmp, evt, helper) {
    	helper.handleScrollMove(cmp, evt);
    },
    
    /**
     * Handle scrollEnd event coming from scroller
     */
    onScrollEnd : function(cmp, evt, helper) {  	
    	helper.handleScrollEnd(cmp, evt);
    },
    
    /**
     * Handle scroller refreshed event
     */
    onScrollerRefreshed: function(cmp, evt, helper) {    	
		//fire selectDefaultPage only after the the scroller has initialized and ready
		var e = cmp.getEvent("selectDefaultPage");
		e.fire();    	
    },
     
    /**
     * Handle window resize event
     */      
	refresh: function(cmp, evt, helper) {	
        helper.refresh(cmp, evt);
    },
    

    onRefreshCurrentPage: function(cmp, evt, helper) {
    	var curPage = cmp.get('v.priv_currentPage');
    	var pages = helper.getPageComponents(cmp);
    	
    	if (curPage > 0 && curPage <= pages.length) {
	    	var e = cmp.get('e.loadPage'),
	    		pageCmp = helper.getPageComponentFromIndex(cmp, curPage),
	    		pageModel = helper.getPageModelFromIndex(cmp, curPage);
	    	
			e.setParams({pageModel: pageModel, pageComponent: pageCmp, pageIndex: curPage});    			
			e.fire();
    	}
    },
    
    /**
     * Handle clicking event from page indicator
     */
    pagerClicked: function (cmp, evt, helper) {    	
        var pageIndex = evt.getParam("pageIndex");
        
        helper.handlePagerClicked(cmp, pageIndex);
        
        if (evt.preventDefault) evt.preventDefault();
    },

    /**
     * Handle key event from page indicator
     */
    pagerKeyed: function (cmp, evt, helper) {	
        helper.handlePagerKeyed(cmp, evt);
    },    
    
    selectDefaultPage: function (cmp, evt, helper) {   	
    	if (cmp.isRendered()) {
    		helper.selectDefaultPage(cmp, evt);
    	}
    }
})
