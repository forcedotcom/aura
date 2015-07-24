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
		var dragClass = component.get("v.dragClass").trim();
		var dragAccessibilityClass = component.get("v.dragAccessibilityClass").trim();
		
		if (!$A.util.isEmpty(dragClass)) {
			cssClass = cssClass.replace(new RegExp(dragClass, "g"), "");
		}
		
		if (!$A.util.isEmpty(dragAccessibilityClass)) {
			cssClass = cssClass.replace(new RegExp(dragAccessibilityClass, "g"), "");
		}
		
		component.set("v.class", cssClass.trim());
	},
	
	setDragClass: function(component, isInAccessibilityMode) {
		var dragClass = component.get("v.dragClass");
		if (isInAccessibilityMode) {
			var dragAccessibilityClass = component.get("v.dragAccessibilityClass");
			if (!$A.util.isEmpty(dragAccessibilityClass)) {
				dragClass = dragAccessibilityClass;
			}
		}
		component.set("v.class", component.get("v.class").trim() + " " + dragClass.trim());
	},
	
	/**
	 * Handle keypress event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for keypress
	 */
	handleKeyPress: function(component, event) {
		// SPACE
		var code = (event.keyCode ? event.keyCode : event.which);
		if (code === 32) {
			// Stop default scroll to bottom behavior
			event.preventDefault();
			if (!$A.util.getBooleanValue(component.get("v.disable"))) {
				this.fireDragStart(component, event.target, true);
				
				// Delegate drag and drop operation to accessibility component
				var accessibilityComponent = component.get("v.accessibilityComponent");
				if (accessibilityComponent) {
					var concreteCmp = $A.componentService.get(accessibilityComponent);
					if (concreteCmp.isInstanceOf("ui:dragAndDropAccessibility")) {
						concreteCmp.startDragAndDrop([component], event.target);
					}
				}
			}
		}
	},
	
	/**
	 * Handle dragstart event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragstart
	 */
	handleDragStart: function(component, event) {
		// Setting up DataTransferObject
		event.dataTransfer.effectAllowed = component.get("v.type");
		
		// Set aura-id of this draggable component so that 
		// we can pass this component to the dropzone
		var auraId = component.getGlobalId();
		
		// Set data to be transferred between drag component and drop component
		var dataTransfer = this.getDataTransfer(component, event);
		if (!$A.util.isUndefinedOrNull(dataTransfer)) {
			if($A.util.isString(dataTransfer)) {
				dataTransfer = { "text/plain": dataTransfer};
			}
			
			if ($A.util.isIE) {
				dataTransfer["aura/id"] = auraId;
				event.dataTransfer.setData("Text", JSON.stringify(dataTransfer));
			} else {
				event.dataTransfer.setData("aura/id", auraId);
				for (var key in dataTransfer) {
					if (key !== "aura/id" && dataTransfer.hasOwnProperty(key)) {
						event.dataTransfer.setData(key, dataTransfer[key]);
					}
				}
			}
		}
		
		// Set custom dragImage
		var dragImageClass = component.get("v.dragImageClass");
		if (!$A.util.isEmpty(dragImageClass)) {
			if (typeof event.dataTransfer.setDragImage === "function") {
				var offsetX = 15, offsetY = 15;
				var cssClasses = [component.get("v.class"), component.get("v.dragImageClass")];
				var dragImage = this.createDragImage(event.target, cssClasses, event.pageX, event.pageY, offsetX, offsetY);
				event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
			}
		}
		
		this.fireDragStart(component, event.target, false);
	},
	
	/**
	 * Override this method to provide your own custom logic.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM event
	 * @return Map<String, String> the data transfer
	 */
	getDataTransfer: function(component, event) {
		return component.get("v.dataTransfer");
	},
	
	fireDragStart: function(component, target, isInAccessibilityMode) {
		// Enter drag operation
		this.enterDragOperation(component, isInAccessibilityMode);
		
		// Fire dragStart event
		var dragEvent = component.getEvent("dragStart");
		dragEvent.setParams({
			"type": component.get("v.type"),
			"dragComponent": component,
			"dragComponentTarget": target,
			"data": component.get("v.dataTransfer"),
			"isInAccessibilityMode": isInAccessibilityMode
		});
		dragEvent.fire();
	},
	
	/**
	 * Create custom drag image.
	 * @param {HTMLElement} element - the draggable element
	 * @parma {String[]} cssClasses - css classes to be attached
	 * @param {int} x - the x coordinate where this dragImage will be positioned
	 * @param {int} y - the y coordinate where this dragImage will be positioned
	 * @param {int} offsetX - the x coordinate offset relative to mouse pointer
	 * @param {int} offsetY - the y coordinate offset relative to mouse pointer
	 */
	createDragImage: function(element, cssClasses, x, y, offsetX, offsetY) {
		// Clone a copy of original draggable element and use it as a dragImage
		var dragImage = document.createElement("div");
		$A.util.forEach(cssClasses, function(cssClass) {
			$A.util.addClass(dragImage, cssClass);
		});
		
		for (var i = 0; i < element.childNodes.length; i++) {
			dragImage.appendChild(element.childNodes[i].cloneNode(true));
		}
		
		dragImage.style.position = "fixed";
		dragImage.style.width = element.clientWidth + "px";
		dragImage.style.top = (y - offsetY) + "px";
		dragImage.style.left = (x - offsetX) + "px";
		dragImage.style.zIndex = "-1";
		
		// In order for dragImage to render properly, dragImage must be visible 
		// to use (i.e. putting it off the screen won't work). But we can remove 
		// the dragImage element right after the dragImage is rendered.
		setTimeout(function() {
			dragImage.parentNode.removeChild(dragImage);
		});
		
		element.parentNode.insertBefore(dragImage, element.nextSibling);
		return dragImage;
	},
	
	isDropEventSuccessful: function(component, event) {
		if (!component.isValid()) {
			return false;
		}
		
		var dropEffect = event.dataTransfer.dropEffect;
		if (dropEffect === "none" && $A.util.isIE) {
			// Don't return false right away, since IE always 
			// returns "none" even though the drop has been performed
			// successfully. This is not the right way to check
			// whether or not drop has been performed since this
			// doesn't handle drag and drop cross different context, 
			// e.g. dropping on different browser windows.
			return component.$dragOperation$.$dropOperationStatus$.getDropStatus();		
		}
		
		return dropEffect === component.get("v.type");
	},

	/**
	 * Handle dragend event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragend
	 */
	handleDragEnd: function(component, event) {
		var isSuccess = this.isDropEventSuccessful(component, event);
		this.fireDragEnd(component, event.target, isSuccess, false);
	},
	
	fireDragEnd: function(component, target, isValid, isInAccessibilityMode) {
		if (component.isValid()) {
			this.exitDragOperation(component, isInAccessibilityMode);
			if (isValid) {
				// drop operation is performed
				this.updateDropOperationStatus(component, "dragEnd", { "dragTarget" :  target});
			} else {
				// drag operation is ended without performing drop operation.
				var dragEvent = component.getEvent("dragEnd");
				dragEvent.setParams({
					"type": component.get("v.type"),
					"dragComponent": component,
					"dragComponentTarget": target
					
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
		this.updateDropOperationStatus(component, "dropComplete", { "dropCompleteEvent" : dragEvent});
	},
	
	/**
	 * Update drop operation status. Drop operation is considered complete when
	 * dragEnd HTML event and dropComplete Aura event have been fired. 
	 * @private
	 * @param {Aura.Component} component - this component
	 * @param {String} eventType - "dragEnd" for dragEnd HTML DOM Event or "dropComplete" for dropComplete Aura event
	 * @param {Object} config - additional config
	 */
	updateDropOperationStatus: function(component, eventType, config) {
		var dragOperationStatus = null
		var dragOperation = component.$dragOperation$;
		if ($A.util.isUndefinedOrNull(dragOperation)) {
			// This could happen when drag and drop is performed in different
			// context, i.e. drag and drop between windows
			dragOperationStatus = this.newDropOperationStatus();
			component.$dragOperation$ = {
				"$dropOperationStatus$": dragOperationStatus
			};
		} else {
			dragOperationStatus = component.$dragOperation$.$dropOperationStatus$;
		}
		
		if (eventType === "dragEnd") {
			dragOperationStatus.setDragEndStatus({
				"type": component.get("v.type"),
				"target": config["dragTarget"]
			});
		} else if (eventType === "dropComplete") {
			var dropCompleteEvent = config["dropCompleteEvent"];
			dragOperationStatus.setDropStatus(true);
			dragOperationStatus.setDropCompleteStatus({
				"dropComponent": dropCompleteEvent.getParam("dropComponent"),
				"status": dropCompleteEvent.getParam("dropComplete")
			});
		}
		
		var dragEndStatus = dragOperationStatus.getDragEndStatus();
		var dragCompleteStatus = dragOperationStatus.getDropCompleteStatus();
		if (dragEndStatus !== null && dragCompleteStatus !== null) {
			var dragEvent = component.getEvent("dragEnd");
			dragEvent.setParams({
				"type": dragEndStatus["type"],
				"dragComponent": component,
				"dragComponentTarget": dragEndStatus["target"],
				"dropComponent": dragCompleteStatus["dropComponent"],
				"data": component.get("v.dataTransfer"),
				"dropComplete": dragCompleteStatus["status"]
			});
			dragEvent.fire();
		}
	},
	
	/**
	 * Make this component entering drag operation.
	 * @param {Aura.Component} component - this component
	 */
	enterDragOperation: function(component, isInAccessibilityMode) {
		component.$dragOperation$ = {
			"$dropOperationStatus$": this.newDropOperationStatus()
		};
		this.setDragClass(component, isInAccessibilityMode);
		
		// Set aria-describe
		component.set("v.ariaGrabbed", true);
	},
	
	newDropOperationStatus: function() {
		return {
			"dragEnd": null,
			"dropSuccessful": false,
			"dropComplete": null,
			"setDragEndStatus": function(status) { this["dragEnd"] = status; },
			"setDropStatus": function(isSuccessful) { this["dropSuccessful"] = isSuccessful; },
			"setDropCompleteStatus": function(status) { this["dropComplete"] = status; },
			"getDragEndStatus": function() { return this["dragEnd"]; },
			"getDropStatus": function() { return this["dropSuccessful"]; },
			"getDropCompleteStatus": function() { return this["dropComplete"]; },
		};
	},
	
	/**
	 * Make this component exiting drag operation.
	 * @param {Aura.Component} component - this component
	 */
	exitDragOperation: function(component, isInAccessibilityMode) {
		// reset onDrag class
		this.resetCssClass(component);
		
		// Set aria-describe
		component.set("v.ariaGrabbed", false);
	}
})