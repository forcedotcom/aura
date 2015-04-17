/*
 * Copyright (C) 2015 salesforce.com, inc.
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
	init: function(component, event, helper) {
		var draggableContext = component.find("list");
		component.set("v.draggableContext", draggableContext);
	},
	
	handleDrop: function(component, event, helper) {
		var target = event.getParam("dropComponent");
		var targetHelper = target.getDef().getHelper();
		
		// add data to list
		targetHelper.addDataTransfer(event);
		
		// fire dragComplete event
		targetHelper.fireDropComplete(event, true);
	},
	
	handleDragEnd: function(component, event, helper) {
		var status = event.getParam("status");
		if (status === "DROP_SUCCESS") {
			// remove data from source
			var source = event.getParam("dragComponent");
			var sourceHelper = source.getDef().getHelper();
			sourceHelper.removeDataTransfer(event, function(o1, o2){
				if (o1 === o2) {
					return 0;
				} else {
					return -1;
				}
			});
		}
	}
})