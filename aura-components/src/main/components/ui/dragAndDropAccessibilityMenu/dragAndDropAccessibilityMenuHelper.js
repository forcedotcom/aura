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
	$isDropPerformed$: false,
	
	startDragAndDrop: function(component, draggables, target) {
		component.set("v.draggables", draggables);
		
		// This assumes homogeneous operation type
		var type = draggables[0].get("v.type");
		var dropzones = this.getDropzoneComponents(type);
		
		if(dropzones.length > 0) {
			this.enterDragOperation(dropzones);
			
			// calculate dropzoneMenu
			var dropzoneMenu = [];
			var self = this;
			$A.util.forEach(dropzones, function(dropzone, index) {
				if (!self.areInSameContext(draggables, dropzone)) {
					var label = dropzone.get("v.label");
					dropzoneMenu.push({
						"value": dropzone,
						"label": $A.util.isEmpty(label) ? "Dropzone " + index : label
					});
				}			
			});		
			component.set("v.dropzoneMenu", dropzoneMenu);	

			// Refresh accessibility menu
			var menu = component.find("menu");
			menu.getEvent("refresh").fire();
			
			// Set referenceElement
			var menuList = component.find("menuList");
			menuList.set("v.referenceElement", target);
			
			// open accessibility menu
			menu.getEvent("popupTriggerPress").fire();
			
			// position accessibility menu
			this.position(menuList, target);
		} else {
			component.set("v.dropzoneMenu", []);
			this.fireDragEnd(draggables, false, target);
		} 			
	},
	
	position: function(targetComponent, referenceEl) {
		targetComponent.constraints = [];
		
		// This is for positioning on the center right of the target component
		targetComponent.constraints.push(this.positioningLib.panelPositioning.createRelationship({
			align:'right center', 
			element:targetComponent.getElement(),
			target:referenceEl,
			targetAlign: 'right center',
			enable: true
		}));
		
		// This is for positioning near the window edges. 
		targetComponent.constraints.push(this.positioningLib.panelPositioning.createRelationship({
			element:targetComponent.getElement(),
			target: window,
			type: 'bounding box',
			boxDirections: {
				top:false,
				bottom:true,
				left:true,
				right:true
			},
			enable: true,
			pad: 100
		}));
		this.positioningLib.panelPositioning.reposition();
	},

	/**
	 * @return true all draggables are in the same context as dropzone
	 */
	areInSameContext: function(draggables, dropzone) {
		var dropzoneContext = $A.dragAndDropService.getContext(dropzone);
		for (var i = 0; i < draggables.length; i++) {
			var draggableContext = $A.dragAndDropService.getContext(draggables[0]);
			if (draggableContext.getGlobalId() !== dropzoneContext.getGlobalId()) {
				return false;
			}
		}
		return true;
	},
	
	handleMenuCollapse: function(component) {
		var menuList = component.find("menuList");
		var menuElement = menuList.getElement();
		menuElement.style.top = "0px";
		menuElement.style.left = "0px";
		
		if(menuList.constraints) {
			menuList.constraints.forEach(function(constraint) {
				constraint.destroy();
			});
		}
		
		var draggables = component.get("v.draggables");
		if (draggables.length > 0) {
			var referenceElement = component.find("menuList").get("v.referenceElement");
			this.fireDragEnd(draggables, this.$isDropPerformed$, referenceElement);
			
			component.set("v.draggables", []);
			this.$isDropPerformed$ = false;
			
			var type = draggables[0].get("v.type");
			this.exitDragOperation(this.getDropzoneComponents(type));
			
			referenceElement.focus();
		}
	},
	
	handleMenuFocusChange: function(previousItem, currentItem) {
		if (!$A.util.isUndefinedOrNull(previousItem)) {
			this.fireDragLeave([previousItem.get("v.value")]);
		}
		
		if (!$A.util.isUndefinedOrNull(currentItem)) {
			this.fireDragEnter([currentItem.get("v.value")]);
		}
	},
	
	handleMenuSelect: function(component, event) {
		var dropzone = event.getParam("selectedItem").get("v.value");
		this.fireDrop([dropzone], component.get("v.draggables"));
		this.$isDropPerformed$ = true;
	}
})// eslint-disable-line semi
