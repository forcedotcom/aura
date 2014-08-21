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
	clearRootBody : function(cmp){
		//TODO W-2352987: Why is this cmp.getSuper().set() and not cmp.set()
		cmp.getSuper().set("v.body", []);
	},
	clearFacetButtonBody : function(cmp){
		cmp.find("facetButton").getSuper().set("v.body", []);
	},
	clearFacetCmpBody : function(cmp){
		cmp.find("facetCmp").set("v.body", []);
	},
	setRootBody : function(cmp){
		$A.newCmpAsync(this,function(newCmp){
				//W-2352987
            	cmp.getSuper().set("v.body", [newCmp]);
			},
			{	
				componentDef:"markup://ui:button",
	            attributes:{
	          	  values:{
	          		  		label : "New button cmp on v.body of root component"  
	                     }
	            },
	            localId: "newCmpOnRootbody"
			}, cmp);
	},
	setRootBody_ReUse : function(cmp){
		$A.newCmpAsync(this,function(newCmp){
			//Reuse an existing component in the new body
			//W-2352987
        	cmp.getSuper().set("v.body", [newCmp, cmp.find("setRootBody_ReUse")]);
		},
		{	
			componentDef:"markup://ui:button",
            attributes:{
          	  values:{
          		  		label : "New button cmp on v.body of root component"  
                     }
            },
            localId: "newCmpOnRootbody"
		}, cmp);
	}
})