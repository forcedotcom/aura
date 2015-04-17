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
			"status": "DRAGGING"
		});
		dragEvent.fire();
	},

	/**
	 * Handle dragend event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragend
	 */
	handleDragEnd: function(component, event) {
		var dropOperationStatus = $dropOperationStatus$;
		this.exitDragOperation(component);
		
		// Fire dragEnd event
		var dragEvent = component.getEvent("dragEnd");
		dragEvent.setParams({
			"type": component.get("v.type"),
			"dragComponent": component,
			"data": component.get("v.dataTransfer"),
			"status": dropOperationStatus ? dropOperationStatus : "DRAG_END"
		});
		dragEvent.fire();
	},
	
	/**
	 * Handle dropComplete event.
	 * @param {Aura.Component} component - this component
	 * @param {Aura.Event} event - Aura Event for dropComplete
	 */
	handleDropComplete: function(component, event) {
		$dropOperationStatus$ = event.getParam("status");
	},
	
	/**
	 * Make this component entering drag operation.
	 * @param {Aura.Component} component - this component
	 */
	enterDragOperation: function(component) {
		$dropOperationStatus$ = null;
		component.set("v.ariaGrabbed", true);
	},
	
	/**
	 * Make this component exiting drag operation.
	 * @param {Aura.Component} component - this component
	 */
	exitDragOperation: function(component) {
		$dropOperationStatus$ = null;
		component.set("v.ariaGrabbed", false);
	},
	
	/**
	 * Remove data being transferred. - TODO: move this into a library or something.
	 * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent
	 * @param {Function} comparator - comparator used for comparison
	 */
	removeDataTransfer: function(dragEvent, comparator) {
		var dragComponent = dragEvent.getParam("dragComponent");
		var context = this.resolveContext(dragComponent);
		
		if(context.get("v.items") && context.getEvent("addRemove")) {
			// Calculate index to be removed
			var record = dragEvent.getParam("data");
			var items = context.get("v.items");
			
			var removeIndex = -1;
			for (var i = 0; i < items.length; i++) {
				if (comparator(record, items[i]) === 0) {
					removeIndex = i;
					break;
				}
			}
			
			// fire addRemove event
			if (removeIndex > -1) {
				var addRemoveEvent = context.getEvent("addRemove");
				addRemoveEvent.setParams({
					"index": removeIndex,
					"count": 1,
					"remove": true
				});
				addRemoveEvent.fire();
			}
		}
	},
	
	resolveContext: function(component) {
		var context = component.get("v.context");
		if (context) {
			if ($A.util.isComponent(context)) {
				return context;
			}
			
			var globalId;
			var valueProvider = component.getAttributeValueProvider();
			var refCmp = valueProvider.find(context);
			if (refCmp) {
				refCmp = refCmp.length ? refCmp[0] : refCmp;
				globalId = refCmp.getGlobalId();
			} else {
				globalId = $A.componentService.get(context) ? context : null;
			}
			
			if (!$A.util.isEmpty(globalId)) {
				return $A.componentService.get(globalId);
			}
		}
		return component;
	}
})