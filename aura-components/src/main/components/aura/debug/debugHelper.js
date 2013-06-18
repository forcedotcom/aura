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
	output : function(cmp, name, msg, purgeOldData) {
		var oldOutput = "";
		if(purgeOldData !== true){
		    oldOutput = cmp.getValue("v."+name).getValue() + "\n";
		}
		
		cmp.getValue("v."+name).setValue(oldOutput + msg);
		$A.rerender(cmp);
		this.scrollToBottom(cmp, name);
	},
	
	scrollToBottom : function(cmp, name) {
		var tabBody = cmp.find(name.replace("Data", "Tab")).find("tabBody");
		var elem = tabBody.getElement();
		elem.scrollTop = elem.scrollHeight;
	},
	
	getAuraStats : function(cmp, viewName) {
		var output = "# of " + viewName + " = ";
		var results = opener.$A.getQueryStatement().from(viewName).query();
		
		if (!$A.util.isUndefinedOrNull(results)) {
			output += results.rows.length + "\n";
		} else {
			output += "Could not retrieve statistics.\n"
		}
		
		return output;
	}
})
