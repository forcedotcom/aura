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
        doInit : function(component, event, helper) {
            var array = [];
            $A.componentService.newComponentAsync(
                    this,
                    function (newcmp) {
                        array.push(newcmp);
                        component.set("v.extendedPullAtrib",array);
                    },
                    {
                        "componentDef": {
                            "descriptor": "markup://ui:outputText"
                        },
                        
                        "attributes": {
                            "values": {
                            	"value"  : "12/12/2012 12:12"
                            }
                        }
                    }
            );
        },
	refresh: function(component, event, helper) {
             helper.refresh(component, "list");
	},

	showMore: function(component, event, helper) {
             helper.showMore(component, "list");
	},
	
	refresh2: function(component, event, helper) {
              helper.refresh(component, "list2");
	},

	showMore2: function(component, event, helper) {
              helper.showMore(component, "list2");
	}
})
