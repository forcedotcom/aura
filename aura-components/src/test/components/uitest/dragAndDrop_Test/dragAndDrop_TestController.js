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
	init: function(component, event, helper) {
		var draggableContext = component.find("list");
		component.set("v._dropzoneContext1", draggableContext[0]);
		component.set("v._dropzoneContext2", draggableContext[1]);
		component.set("v._dropzoneContext3", draggableContext[2]);
		component.set("v._dropzoneContext4", draggableContext[3]);
		component.set("v._draggableContext1", draggableContext[0]);
		component.set("v._draggableContext2", draggableContext[1]);
		component.set("v._draggableContext3", draggableContext[2]);
		component.set("v._draggableContext4", draggableContext[3]);
		component.set("v._accessibilityComponent", component.find("accessibilityComponent").getGlobalId());
	},
	
	handleDrop: function(component, event, helper) {	
		$A.dragAndDropService.fireDropComplete(event, true);
	},
	
	handleDragEnd: function(component, event, helper) {
		var dropComplete = $A.util.getBooleanValue(event.getParam("dropComplete"));
		if (dropComplete) {
			// Calculate index to be removed
			var record = event.getParam("data");
	    	var source = $A.dragAndDropService.getContext(event.getParam("dragComponent"));
	    	var items = source.get("v.items");
	    	
	    	var removeIndex = -1;
	    	for (var i = 0; items && i < items.length; i++) {
				if (record === items[i]) {
					removeIndex = i;
					break;
				}
	    	}
	    	
			var removeParams = {
				"index": removeIndex,
				"count": 1,
				"remove": true
			};
			
			// Remove data transfer
			$A.dragAndDropService.removeDataTransfer(event, removeParams);
			
			// Add data transfer
			var target = $A.dragAndDropService.getContext(event.getParam("dropComponent"));
			var dataProvider = target.get("v.dataProvider[0]");
	    	var onChangeEvent = dataProvider.getEvent("onchange");
	    	onChangeEvent.setParams({
				"data" : [event.getParam("data")]
			});
	    	onChangeEvent.fire();
		}
	}
})