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
    
    /**
     *  Handle pageSelected event     
     */    
    pageSelected: function(cmp, evt, helper) {    	
    	helper.selectPage(cmp, evt.getParam("pageIndex"));
    },
    
    selectDefaultPage: function (cmp, evt, helper) {   	
    	if (cmp.isRendered()) {
    		helper.selectDefaultPage(cmp, evt);
    	} else {
    		if (cmp._selectDefaultPageTimer) {
    			clearTimeout(cmp._selectDefaultPageTimer);
    			cmp._selectDefaultPageTimer = null;
    		}    		
    		cmp._selectDefaultPageTimer = setTimeout(function(){
    			cmp._selectDefaultPageTimer = null;
				helper.selectDefaultPage(cmp, evt);
			}, 0);
    	}
    }
})
