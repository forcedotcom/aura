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
	$dropStatus$: {},
	
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
		var dropStatus = this.$dropStatus$;
		this.exitDragOperation(component);

		// Fire dragEnd event
		var dragEvent = component.getEvent("dragEnd");
		dragEvent.setParams({
			"type": component.get("v.type"),
			"dragComponent": component,
			"dropComponent": dropStatus["dropComponent"],
			"data": component.get("v.dataTransfer"),
			"status": dropStatus["status"] ? dropStatus["status"] : $A.dragAndDropService.OperationStatus.DRAG_END
		});
		dragEvent.fire();
	},
	
	/**
	 * Handle dropComplete event.
	 * @param {Aura.Component} component - this component
	 * @param {Aura.Event} dragEvent - Aura Event for dropComplete. Must be of type ui:dragEvent
	 */
	handleDropComplete: function(component, dragEvent) {
		this.setDropStatus(dragEvent);
	},
	
	setDropStatus: function(dragEvent) {
		this.$dropStatus$ = {
			"dropComponent": dragEvent ? dragEvent.getParam("dropComponent") : null,
			"status": dragEvent ? dragEvent.getParam("status") : null
		};
	},
	
	/**
	 * Make this component entering drag operation.
	 * @param {Aura.Component} component - this component
	 */
	enterDragOperation: function(component) {
		this.setDropStatus();
		component.set("v.ariaGrabbed", true);
	},
	
	/**
	 * Make this component exiting drag operation.
	 * @param {Aura.Component} component - this component
	 */
	exitDragOperation: function(component) {
		this.setDropStatus();
		component.set("v.ariaGrabbed", false);
	}
})