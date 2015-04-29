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
	/**
	 * Handle dragenter event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragenter
	 */
	handleDragEnter: function(component, event) {
		// Fire dragEnter event
		var dragEvent = component.getEvent("dragEnter");
		dragEvent.setParams({
			"dropComponent": component,
			"dropComponentTarget": $A.componentService.getRenderingComponentForElement(event.target)
		});
		dragEvent.fire();
	},
	
	/**
	 * Handle dragover event. This handler is called every few hundred milliseconds.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragover
	 */
	handleDragOver: function(component, event) {
		var effectAllowed = event.dataTransfer.effectAllowed;
		var types = component.get("v.types");
		if (effectAllowed === "all" || types.indexOf(effectAllowed) > -1) {
			if (event.preventDefault) {
				// Necessary. Allows us to drop, i.e. this is a dropzone component
				event.preventDefault(); 
			}
			
			// The actual effect that will be used, 
			// and should always be one of the possible values of effectAllowed.
			event.dataTransfer.dropEffect = effectAllowed;
			
			// Prevent default behavior in certain browser such as
			// navigate to link when the dropzone is an anchor element
			return false;
		}
		
		return true;
	},
	
	/**
	 * Handle dragleave event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragleave
	 */
	handleDragLeave: function(component, event) {		
		// Fire dragLeave event
		var dragEvent = component.getEvent("dragLeave");
		dragEvent.setParams({
			"dropComponent": component,
			"dropComponentTarget": $A.componentService.getRenderingComponentForElement(event.target)
		});
		dragEvent.fire();
	},
	
	/**
	 * Handle drop event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for drop
	 */
	handleDrop: function(component, event) {
		if (event.stopPropagation) {
			// stops some browsers from redirecting.
			event.stopPropagation();
		}
		
		// Get draggable component
		var auraId = event.dataTransfer.getData("aura-id");
		var dragComponent = $A.getCmp(auraId);
		
		// Check for supported drop operation
		var supportedTypes = component.get("v.types");
		var operationType = dragComponent.get("v.type");
		if (supportedTypes.indexOf(operationType) > -1) {
			// Get data being transferred
			var data = {};
			var dataTransferTypes = event.dataTransfer.types;
			$A.util.forEach(dataTransferTypes, function (dataTransferType){
				if (dataTransferType !== "aura-id") {
					data[dataTransferType] = event.dataTransfer.getData(dataTransferType);
				}
			})
			
			// Fire drop event
			var dragEvent = component.getEvent("drop");
			dragEvent.setParams({
				"type": operationType,
				"dragComponent": dragComponent,
				"dropComponent": component,
				"dropComponentTarget": $A.componentService.getRenderingComponentForElement(event.target),
				"data": data
			});
			dragEvent.fire();
		}
		
		// Prevent default browser action, such as redirecting
		return false;
	},
	
	/**
	 * Make this component entering drag operation.
	 * @param {Aura.Component} component - this component
	 */
	enterDragOperation: function(component) {
		var type = component.get("v.type");
		component.set("v.ariaDropEffect", type);
	},
	
	/**
	 * Make this component exiting drag operation.
	 * @param {Aura.Component} component - this component
	 */
	exitDragOperation: function(component) {
		component.set("v.ariaDropEffect", "none");
	}
})