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
	throwErrorForKicks: function(cmp) {
		// this sample always throws an error
		var hasPerm = false;
		try {
		    if (!hasPerm) {
		        throw new Error("You don't have permission to edit this record.");
		    }
		}
		catch (e) {
		    // config for a dynamic ui:message component
			var componentConfig = {
				    componentDef : "markup://ui:message",
				    attributes : {
				        values : {
				            title : "Sample Thrown Error",
				            severity : "error",
				            body : [
				                {
				                    componentDef : "markup://ui:outputText",
				                    attributes : {
				                        values : {
				                            value : e.message
				                        }
				                    }
				                }
				            ]
				        }
				    }
				};
			
			var message = $A.componentService.newComponent(componentConfig);
			
			var div1 = cmp.find("div1");
			var divBody = div1.getValue("v.body");
			
			// Destroy existing body and replace it with the dynamic component
			divBody.destroy();
			divBody.setValue(message);			
		}
	}
})
