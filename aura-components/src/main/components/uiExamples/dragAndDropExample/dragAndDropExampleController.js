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
		component.set("v._draggableContext1", draggableContext[0]);
		component.set("v._draggableContext2", draggableContext[1]);
	},
	
	handleDrop: function(component, event, helper) {
		var target = event.getParam("dropComponent");
		var targetHelper = target.getDef().getHelper();
		targetHelper.fireDropComplete(event, true);
	},
	
	handleDragEnd: function(component, event, helper) {
		var status = event.getParam("status");
		if (status === $A.dragAndDropService.OperationStatus.DROP_SUCCESS) {
			$A.dragAndDropService.moveDataTransfer(event, function(o1, o2){
				if (o1 === o2) {
					return 0;
				} else {
					return -1;
				}
			});
		}
	}
})