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
	$dropOperationStatus$: null,
	
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
		});
		dragEvent.fire();
	},

	/**
	 * Handle dragend event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragend
	 */
	handleDragEnd: function(component, event) {
		if (component.isValid()) {
			this.exitDragOperation(component);
			var dropEffect = event.dataTransfer.dropEffect;
			if (dropEffect === component.get("v.type")) {
				// drop operation is performed
				this.updateDropOperationStatus(component, "dragEnd", event);
			} else {
				// drag operation is ended without performing drop operation.
				var dragEvent = component.getEvent("dragEnd");
				dragEvent.setParams({
					"type": dropEffect,
					"dragComponent": component
				});
				dragEvent.fire();
			}
		}
	},
	
	/**
	 * Handle dropComplete event.
	 * @param {Aura.Component} component - this component
	 * @param {Aura.Event} dragEvent - Aura Event for dropComplete. Must be of type ui:dragEvent
	 */
	handleDropComplete: function(component, dragEvent) {
		this.updateDropOperationStatus(component, "dropComplete", dragEvent);
	},
	
	/**
	 * Update drop operation status. Drop operation is considered complete when
	 * dragEnd HTML event and dropComplete Aura event have been fired. 
	 * @param {Aura.Component} component - this component
	 * @param {String} eventType - "dragEnd" for dragEnd HTML DOM Event or "dropComplete" for dropComplete Aura event
	 * @param {(Event|Aura.Event)} event - the HTML DOM Event for dragend or dropComplete Aura event
	 */
	updateDropOperationStatus: function(component, eventType, event) {
		if (this.$dropOperationStatus$ == null) {
			this.$dropOperationStatus$ = {
				"dragEnd": null,
				"dropComplete": null,
			};
		}
		
		if (eventType === "dragEnd") {
			this.$dropOperationStatus$["dragEnd"] = {
				"type": event.dataTransfer.dropEffect
			};
		} else if (eventType === "dropComplete") {
			this.$dropOperationStatus$["dropComplete"] = {
				"dropComponent": event.getParam("dropComponent"),
				"status": event.getParam("dropComplete")
			};
		}
		
		// Ultimately this should be implemented with either Promise
		// or Object.observe() instead of dirty checking. However,
		// IE doesn't support either of those.
		if (this.$dropOperationStatus$["dragEnd"] !== null && this.$dropOperationStatus$["dropComplete"] !== null) {
			var dragEvent = component.getEvent("dragEnd");
			dragEvent.setParams({
				"type": this.$dropOperationStatus$["dragEnd"]["type"],
				"dragComponent": component,
				"dropComponent": this.$dropOperationStatus$["dropComplete"]["dropComponent"],
				"data": component.get("v.dataTransfer"),
				"dropComplete": this.$dropOperationStatus$["dropComplete"]["status"]
			});
			dragEvent.fire();
		}
	},
	
	/**
	 * Make this component entering drag operation.
	 * @param {Aura.Component} component - this component
	 */
	enterDragOperation: function(component) {
		this.$dropOperationStatus$ = null;
		component.set("v.ariaGrabbed", true);
	},
	
	/**
	 * Make this component exiting drag operation.
	 * @param {Aura.Component} component - this component
	 */
	exitDragOperation: function(component) {
		component.set("v.ariaGrabbed", false);
	}
})