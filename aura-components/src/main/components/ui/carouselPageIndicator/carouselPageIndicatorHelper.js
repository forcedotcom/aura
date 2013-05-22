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
	onPageSelected: function (cmp, evt) {
		
        var currentPage = cmp.get("v.currentPage"),
        	pages = cmp.get("v.pageComponents"),
        	//page index starts at 1
        	targetPage =  evt.getParam("pageIndex") - 1,
        	e,
        	pageItems = cmp.find('indicatorItems');

        if (pages && pages.length == 1) {
        	//fire event to target indicator item
        	e = pageItems.get("e.pageSelected");
			e.setParams(evt.getParams())
			e.fire();
			cmp.getValue('v.currentPage').setValue(targetPage); 
        }
        else if (pages && pages.length > 1 && targetPage < pages.length && targetPage >= 0) {        	        	
    		if (typeof currentPage != 'undefined') {
    			//fire event to previous selected indicator item
    			e = pageItems[currentPage].get("e.pageSelected");
    			e.setParams(evt.getParams())
    			e.fire();
    		}
    		        	   	
        	pageItems[targetPage].getElement().focus();
        	         	
        	//fire event to target indicator item
        	e = pageItems[targetPage].get("e.pageSelected");
			e.setParams(evt.getParams())
			e.fire();
             
        	cmp.getValue('v.currentPage').setValue(targetPage);        	
        }       
    } 
}