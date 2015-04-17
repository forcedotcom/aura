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
		if (event.preventDefault) {
			// Necessary. Allows us to drop, i.e. this is a dropzone component
			event.preventDefault(); 
		}

		// The actual effect that will be used, 
		// and should always be one of the possible values of effectAllowed.
		event.dataTransfer.dropEffect = component.get("v.type");
		
		// Prevent default behavior in certain browser such as
		// navigate to link when the dropzone is an anchor element
		return false;
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
			"dropComponentTarget": $A.componentService.getRenderingComponentForElement(event.target),
			"status": "DROPPING"
		});
		dragEvent.fire();
	},
	
	/**
	 * Handle drop event.
	 * @param {Aura.Component} component - this component
	 * @param {Event} event - HTML DOM Event for dragleave
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
			var dataTransfer = event.dataTransfer.getData("aura-data");
			var data = JSON.parse(dataTransfer);
			
			// Fire drop event
			var dragEvent = component.getEvent("drop");
			dragEvent.setParams({
				"type": operationType,
				"dragComponent": dragComponent,
				"dropComponent": component,
				"dropComponentTarget": $A.componentService.getRenderingComponentForElement(event.target),
				"data": data,
				"status": "DROPPING"
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
	},
	
	/**
	 * Fire a dropComplete event.
	 * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent.
	 * @param {boolean} success - true if drop operation is successful or false otherwise
	 */
	fireDropComplete: function(dragEvent, success) {
		var dragComponent = dragEvent.getParam("dragComponent");
		var type = dragEvent.getParam("type");
		var dropCompleteEvent = dragComponent.getEvent("dropComplete");
		dropCompleteEvent.setParams({
			"type": type,
			"status": success ? "DROP_SUCCESS" : "DROP_ERROR"
		});
		dropCompleteEvent.fire();
	},
	
	/**
	 * Add data being transferred. TODO: move this to a library or something.
	 * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent.
	 */
	addDataTransfer: function(dragEvent) {
		var dragComponent = dragEvent.getParam("dragComponent");
		var dropComponent = dragEvent.getParam("dropComponent");
		var context = this.resolveContext(dropComponent);
		var dataTransfer = dragComponent.get("v.dataTransfer");
		
		if (context.hasEventHandler("addRemove")) {
			// fire addRemove event -- addRemove event in ui:abstractList is unsupported yet!
//			var list = component.find("list");
//			var addRemoveEvent = list.getEvent("addRemove");
//			addRemoveEvent.setParams({
//				"index": 0
//				"items": [dataTransfer]
//			});
//			addRemoveEvent.fire();
		} else if (context.get("v.dataProvider[0]")) {
			// fire onchange event on dataProvider -- this will only add to last index
			var dataProvider = context.get("v.dataProvider[0]");
	    	var onChangeEvent = dataProvider.getEvent("onchange");
	    	onChangeEvent.setParams({
				"data" : [dataTransfer]
			});
	    	onChangeEvent.fire();
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