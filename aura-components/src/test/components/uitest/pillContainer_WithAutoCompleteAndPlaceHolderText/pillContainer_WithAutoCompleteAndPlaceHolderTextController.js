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

	init: function(cmp, evt, helper) {
		pillContainer = cmp.find("pillContainer");
		pillContainer.set("v.maxAllowed", 2);
		pillContainer.set("v.items",[helper.PILLS[0],helper.PILLS[1]]);
	},
    
    handleMatchDone: function(component, event, helper) {
    },

    handleSelectOption: function(component, event, helper) {
    }
})
