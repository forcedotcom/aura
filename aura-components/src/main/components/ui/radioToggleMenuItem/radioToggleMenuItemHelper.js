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
	handleClick: function(cmp) {
		var current = cmp.get("v.selected");
        if (current === false) {
        	cmp.set("v.selected", !current);
        } else {
        	this.toggleState(cmp);
        }
	},

    toggleState: function(cmp) {
    	var ascending = $A.util.getBooleanValue(cmp.get("v.isAscending"));
    	
    	cmp.set("v.isAscending", !ascending, true);
    	
    	this.updateDirection(cmp, !ascending)
    },
    
    updateDirection: function(cmp, ascending) {
    	var asc = ascending || cmp.get("v.isAscending");
    	var ascLabel = cmp.find("ascLabel").getElement();
    	var descLabel = cmp.find("descLabel").getElement();
    	
    	if (asc) {
    		$A.util.addClass(ascLabel, "visible");
    		$A.util.removeClass(descLabel, "visible");
    	} else {
    		$A.util.addClass(descLabel, "visible");
    		$A.util.removeClass(ascLabel, "visible");
    	}
    }
})
