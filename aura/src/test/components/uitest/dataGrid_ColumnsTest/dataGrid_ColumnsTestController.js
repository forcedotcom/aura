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
	//Only add due date
    addAColumn    : function(cmp, evt, helper){
    	var cols = helper.getColumnJson(4, 1, "A");
		helper.addColumns(cmp, cols, cmp.get("v.appendOrOverwrite"));
    },
    //Get All elements
	goTo5Columns  : function(cmp, evt, helper){
		var cols = helper.getColumnJson(0, 5, "A");
		helper.addColumns(cmp, cols, cmp.get("v.appendOrOverwrite"));
	}, 
	
	//Only get the first two headers/columns (id, column)
	goTo2Columns  : function(cmp, evt, helper){
		var cols;
		
		if(cmp.get("v.useSecondColumnType") == true){
			cols = helper.getColumnJson(0, 2, "B");
			cmp.set("v.useSecondColumnType", false);			
		}
		else {
			cols = helper.getColumnJson(2, 2, "B");
			cmp.set("v.useSecondColumnType", true);
		}
		
		helper.addColumns(cmp, cols, cmp.get("v.appendOrOverwrite"));
	}, 
	
	//Only add the third column (name)
	goTo1Column   : function(cmp, evt, helper){
		var cols = helper.getColumnJson(2, 1, "A");
		helper.addColumns(cmp, cols, cmp.get("v.appendOrOverwrite"));
	}, 
	
	goToColumnWithWrongName : function(cmp, evt, helper){
		var cols = helper.getColumnJson(0, 5, "C");
		helper.addColumns(cmp, cols, cmp.get("v.appendOrOverwrite"));
	}, 
	
	removeColumns : function(cmp, evt, helper){
		helper.addColumns(cmp, [], "overwrite");
	}
})