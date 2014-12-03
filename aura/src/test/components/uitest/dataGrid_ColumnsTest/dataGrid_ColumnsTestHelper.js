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
	//Create the json header that will link with the data provider
    getColumnJson : function(colStart, amount, useGroup){
    	var COLUMN_HEADER_A = [{label:'Id', name: "id"},
    	                       {label:'Subject',  name: "subject"},{label:'Name', name: "name"},
    	                       {label:'RelatedTo', name: "relatedTo"}, {label:'Due Date', name: "date"}],

    	    COLUMN_HEADER_B = [{label:'Item Id', name: "id"},
    	                       {label:'Item Subject',  name: "subject"},{label:'Item Name', name: "name"},
    	                       {label:'Item RelatedTo', name: "relatedTo"}, {label:'Item Due Date', name: "date"}],
    	    
    	    COLUMN_HEADER_S = [{label:'Item Id', name: "id", sortable: "true"},
    	         	           {label:'Item Subject',  name: "subject"},{label:'Item Name', name: "name", sortable: "true"},
    	               	       {label:'Item RelatedTo', name: "relatedTo"}, {label:'Item Due Date', name: "date"}];
    	
    	 var arr = [];
    	 if (useGroup == "A") {
    		 arr = COLUMN_HEADER_A;
    	 } else if (useGroup == "B") {
    		 arr = COLUMN_HEADER_B;
    	 } else if (useGroup == "S") {
    		 arr = COLUMN_HEADER_S; 
    	 } else {
    		 arr = COLUMN_HEADER_A;
    		 arr[4].name = "Date";
    	 }
    	 
    	 return arr.splice(colStart, amount);
    	 
    },
    
    //Add all of the columns that are sent in
    addColumns : function(cmp, colJson, which2use){
      var colToEndOn   = colJson.length;
      var columns = [];
      var funcToUse =  function(newCmp) {
		    columns.push(newCmp);
      };

     
	  for(var i = 0; i<colToEndOn; i++){  
    	this.createColumns(colJson[i], funcToUse);
      }

	  var grid = cmp.find("grid");
      if(which2use === "overwrite"){
    	  grid.set("v.columns", columns);
      }
      else{
          grid.set("v.columns", grid.get("v.columns").concat(columns));
      }
    },
    
    //Creating the columns and adding them into the array to put in the data grid
    createColumns : function(colInfo, funcToUse){
    	$A.newCmpAsync(
				this,
				funcToUse,
				{
					"componentDef": "markup://ui:dataGridColumn",
		            "attributes": {
		                "values": colInfo
		            }
				});
    }
})