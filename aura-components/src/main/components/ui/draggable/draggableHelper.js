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
	$dragStatus$: {},
	
	/**
	 * Handle dragstart event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragstart
	 */
	handleDragStart: function(component, event) {
		this.enterDragOperation(component);
		
		// Setting up DataTransferObject
		var type = component.get("v.type");
		event.dataTransfer.effectAllowed = type;
		
		// Set aura-id of this draggable component so that 
		// we can pass this component to the dropzone
		event.dataTransfer.setData("aura-id", component.getGlobalId());
		
		// Set data to be transferred between drag component and drop component
		var dataTransfer = component.get("v.dataTransfer");
		if ($A.util.isUndefinedOrNull(dataTransfer)) {
			dataTransfer = {};
		}
		event.dataTransfer.setData("aura-data", JSON.stringify(dataTransfer));
		
		// Fire dragStart event
		var dragEvent = component.getEvent("dragStart");
		dragEvent.setParams({
			"type": type,
			"dragComponent": component,
			"data": dataTransfer,
			"status": $A.dragAndDropService.OperationStatus.DRAGGING
		});
		dragEvent.fire();
	},

	/**
	 * Handle dragend event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragend
	 */
	handleDragEnd: function(component, event) {
		var dragEvent = component.getEvent("dragEnd");
		var dropEffect = event.dataTransfer.dropEffect 
		if (dropEffect === component.get("v.type")) {
			dragEvent.setParams({
				"type": dropEffect,
				"dragComponent": component,
				"dropComponent": this.$dropStatus$["dropComponent"],
				"data": component.get("v.dataTransfer"),
				"status": this.$dropStatus$["status"] ? this.$dropStatus$["status"] : $A.dragAndDropService.OperationStatus.DRAG_END
			});
		} else {
			dragEvent.setParams({
				"type": dropEffect,
				"dragComponent": component,
				"status": $A.dragAndDropService.OperationStatus.DRAG_END
			});
		}
		
		this.exitDragOperation(component);
		dragEvent.fire();
	},
	
	/**
	 * Handle dropComplete event.
	 * @param {Aura.Component} component - this component
	 * @param {Aura.Event} dragEvent - Aura Event for dropComplete. Must be of type ui:dragEvent
	 */
	handleDropComplete: function(component, dragEvent) {
		this.setDragStatus(dragEvent.getParam("status"), dragEvent.getParam("dropComponent"));
	},
	
	/**
	 * Set drag and drop operation status for this draggable component
	 * @param {String} status - status of the drag and drop operation
	 * @param {Aura.Component} dropComponent - the drop component if applicable
	 */
	setDragStatus: function(status, dropComponent) {
		this.$dropStatus$ = {
			"status": status,
			"dropComponent": dropComponent
		};
	},
	
	/**
	 * Make this component entering drag operation.
	 * @param {Aura.Component} component - this component
	 */
	enterDragOperation: function(component) {
		this.setDragStatus($A.dragAndDropService.OperationStatus.DRAGGING);
		component.set("v.ariaGrabbed", true);
	},
	
	/**
	 * Make this component exiting drag operation.
	 * @param {Aura.Component} component - this component
	 */
	exitDragOperation: function(component) {
		this.setDragStatus();
		component.set("v.ariaGrabbed", false);
	}
})