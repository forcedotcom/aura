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
   
	init : function(cmp) {
		var opts = [];
		opts4 =[{ "label": "Option1", "value": "Option1", "class": "option" },
	            { "label": "Option2", "value": "Option2", "class": "option", selected: true },
	            { "label": "Option3", "value": "Option3", "class": "option" },
	            { "label": "Option4", "value": "Option4", "class": "option" }],
	    opts2 = [{ "label": "OptionA", "value": "OptionA", "class": "option", selected: true },
		            { "label": "OptionB", "value": "OptionB", "class": "option" }];    
		
		//Checking which options should be set
		var which2use = cmp.get("v.whichOption");
		if(which2use == 4){
		    opts = opts4;	
		}
		else if(which2use == 2){
			opts = opts2;
		}
			
		cmp.find("dynamicSelect").set("v.options", opts);
	}
})