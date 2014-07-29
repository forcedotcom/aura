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
	 //If in the correct mode, creating the necessary inputDefaultError
	 init : function(cmp, evt, hlp) {
            if(cmp.get("v.caseToRender") == 'dynamic'){
            	  hlp.createNewCmp(cmp, "1");
            }           
    },
    
    //Creating a new defaultError component on the fly
    createNew : function(cmp, evt, hlp) {
       hlp.createNewCmp(cmp, "2");
    },


     //controller that grabs all the ids and puts invalidates all of them
     validateInput : function(cmp, evt, helper){
    	 var baseId = cmp.get("v.caseToRender");
    	 var componentIdArray = [];
    	 
    	 if(baseId === 'all'){
    		 componentIdArray = ["default", "select", "search", "textArea", "date", "radio", "range", "autoCompleteTextArea", "autoCompleteText", "text"];
    	 }
    	 else{
    		 componentIdArray = [baseId];
    	 }
    	 
    	 //Going through Array. This id array will be either of size 1 or 12. 
    	 //It will get the component associated with each element then invalidate it 
    	 for(var i = 0; i < componentIdArray.length; i++){
    		 helper.addErrorsToCmp(cmp.find(componentIdArray[i] +"Invalid"));
    	 }
    	 
     }
 })