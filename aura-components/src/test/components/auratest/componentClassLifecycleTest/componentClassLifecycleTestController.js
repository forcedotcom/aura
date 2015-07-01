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
	createCmp : function(cmp, event, helper) {
		
		var cmpDef = cmp.get("v.cmpDef");
		var errorOutFrom = cmp.get("v.errorOutFrom");
        //componentDef : "markup://auratest:componentClassParent",
		var componentConfig = {
        		componentDef : cmpDef,
    			attributes : {
                     values : {
                    	 errorOutFromRender_Parent : true
                     }
                 }
        };
        //create the component and push it to testCmp's body
        //var that = this;
        //var cmpCreated = false;
       
    	$A.componentService.newComponentAsync(this, function(newCmp) {
            var output = cmp.find("client");
            var body = output.get("v.body");
            body.push(newCmp);
            output.set("v.body", body);
            //cmpCreated = true;
        }, componentConfig, null, true, true);
        
    }

})
