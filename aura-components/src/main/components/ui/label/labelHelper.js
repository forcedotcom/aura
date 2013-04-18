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
	updateAttribute: function(cmp){  
		
        var forVal = cmp.getAttributes().getValue("for").getValue();
        if (forVal) {      
        	var gId;
        	if ($A.util.isString(forVal)) {
                var valueProvider = cmp.getAttributes().getValueProvider();
                //try find the target component for the "for" attribute from valueProvider
                var refCmp = valueProvider.find(forVal);
                
                if (refCmp) {
                	//use first one in the list if there are multiples
                	refCmp = refCmp.length ? refCmp[0] : refCmp;                 	
                	gId = refCmp.getGlobalId();
                } else {
                	//try as globalId
                	gId = $A.componentService.get(forVal) ? forVal : null;	                	
                }
        	} else if ($A.util.isObject(forVal) && forVal.getGlobalId) {            		
        		gId = forVal.getGlobalId();            		
        	}
        	
        	if (!$A.util.isEmpty(gId)) {
        		//update dom element directly
            	cmp.getElement().setAttribute("for", gId);
            }
        }         
    }
})