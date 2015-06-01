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
	resetCssClass: function(component) {
		var cssClass = component.get("v.class").trim();
		var dragOverClass = component.get("v.dragOverClass").trim();
		var dragOverAccessibilityClass = component.get("v.dragOverAccessibilityClass").trim();
		
		if (!$A.util.isEmpty(dragOverClass)) {
			cssClass = cssClass.replace(dragOverClass, "");
		}
		
		if (!$A.util.isEmpty(dragOverAccessibilityClass)) {
			cssClass = cssClass.replace(dragOverAccessibilityClass, "");
		}
		
		component.set("v.class", cssClass);
	},
	
	setDragOverClass: function(component, isInAccessibilityMode) {
		var dragOverClass = component.get("v.dragOverClass");
		if (isInAccessibilityMode) {
			var dragOverAccessibilityClass = component.get("v.dragOverAccessibilityClass");
			if (!$A.util.isEmpty(dragOverAccessibilityClass)) {
				dragOverClass = dragOverAccessibilityClass;
			}
		}
		component.set("v.class", component.get("v.class").trim() + " " + dragOverClass.trim());
	},
	
	/**
	 * Handle dragenter event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragenter
	 */
	handleDragEnter: function(component, event) {
		this.fireDragEnter(component, $A.componentService.getRenderingComponentForElement(event.target), false);
	},
	
	fireDragEnter: function(component, targetComponent, isInAccessibilityMode) {
		// Set onDragOver class
		this.setDragOverClass(component, isInAccessibilityMode);
		
		var dragEvent = component.getEvent("dragEnter");
		dragEvent.setParams({
			"dropComponent": component,
			"dropComponentTarget": targetComponent,
			"isInAccessibilityMode": isInAccessibilityMode
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
		this.fireDragLeave(component, $A.componentService.getRenderingComponentForElement(event.target), false);
	},
	
	fireDragLeave: function(component, targetComponent, isInAccessibilityMode) {
		// reset onDragOver class
		this.resetCssClass(component);
		
		var dragEvent = component.getEvent("dragLeave");
		dragEvent.setParams({
			"dropComponent": component,
			"dropComponentTarget": targetComponent,
			"isInAccessibilityMode": isInAccessibilityMode
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
		var auraId = event.dataTransfer.getData("aura/id");
		var dragComponent = $A.getCmp(auraId);
		
		// Check for supported drop operation
		var supportedTypes = component.get("v.types");
		var operationType = event.dataTransfer.effectAllowed;
		if (operationType === "all" || supportedTypes.indexOf(operationType) > -1) {	
			var dataTransfer = {};
			if (!$A.util.isUndefinedOrNull(dragComponent) && dragComponent.isValid()) {
				dataTransfer = dragComponent.get("v.dataTransfer");
			} else {
				var dataTransferTypes = event.dataTransfer.types;
				for (var i = 0; i < dataTransferTypes.length; i++) {
					var dataTransferType = dataTransferTypes[i];
					if (dataTransferType !== "aura/id") {
						dataTransfer[dataTransferType] = event.dataTransfer.getData(dataTransferType);
					}
				}
			}
			
			this.fireDrop(component, operationType, dataTransfer, dragComponent, $A.componentService.getRenderingComponentForElement(event.target), false);
		}
		
		// Prevent default browser action, such as redirecting
		return false;
	},
	
	fireDrop: function(component, operationType, dataTransfer, dragComponent, targetComponent, isInAccessibilityMode) {
		// reset onDragOver class
		this.resetCssClass(component);
		
		var dragEvent = component.getEvent("drop");
		dragEvent.setParams({
			"type": operationType,
			"dragComponent": dragComponent,
			"dropComponent": component,
			"dropComponentTarget": targetComponent,
			"data": dataTransfer,
			"isInAccessibilityMode": isInAccessibilityMode
		});
		dragEvent.fire();
	},
	
	/**
	 * Make this component entering drag operation.
	 * @param {Aura.Component} component - this component
	 */
	enterDragOperation: function(component) {
		var types = component.get("v.types");
		component.set("v.ariaDropEffect", types.join(" "));
	},
	
	/**
	 * Make this component exiting drag operation.
	 * @param {Aura.Component} component - this component
	 */
	exitDragOperation: function(component) {
		component.set("v.ariaDropEffect", "none");
		
		// reset onDragOver class
		this.resetCssClass(component);
	}
})