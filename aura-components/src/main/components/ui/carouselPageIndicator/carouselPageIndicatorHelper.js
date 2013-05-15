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
	handleScrollChange: function (cmp, event) {		
		
        var currentPage = cmp.get("v.currentPage"),
        	pages = cmp.get("v.pageComponents"),
        	targetPage =  event.getParam("currentPageX");
        
        if (targetPage < pages.length && targetPage >= 0) {
        	var pageItems = cmp.find('indicatorItems'),        	
        		e;
        	
    		if (typeof currentPage != 'undefined') {
    			e = pageItems[currentPage].get("e.pageSelected");
    			e.setParams({pageIndex: targetPage})
    			e.fire();
    		}
    		        	   	
        	pageItems[targetPage].getElement().focus();
        	         	
        	e = pageItems[targetPage].get("e.pageSelected");
			e.setParams({pageIndex: targetPage})
			e.fire();
             
        	cmp.getValue('v.currentPage').setValue(targetPage);        	
        }
        
        return true;        
    } 
}