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
	init : function(cmp){
		cmp.set("v.listOfMapAttr", [{'a':'Tony'},{'a':'Romo'}]);
	},
	changeItems : function(cmp){
		var simpleList = cmp.get("v.simpleListAttr");
		cmp._originalSimpleList = simpleList;
		cmp.set("v.simpleListAttr", [99,100,101,102,103]);
		
		var listOfMap = cmp.get("listOfMapAttr");
		cmp._listOfMap = listOfMap;
		cmp.set("v.listOfMapAttr", [{'a':'Tom'},{'a':'Brady'}]);
	},
	clearItems : function(cmp){
		cmp.set("v.simpleListAttr", []);
		cmp.set("v.listOfMapAttr", []);
	}
})