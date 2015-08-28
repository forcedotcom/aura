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
    handleDragEnter: function (component, event, helper) {
    	helper.handleDragEnter(component, event);
    },
    
    handleDragOver: function (component, event, helper) {
    	helper.handleDragOver(component, event);
    },
    
    handleDragLeave: function (component, event, helper) {
    	helper.handleDragLeave(component, event);
    },
    
    handleDrop: function (component, event, helper) {
    	helper.handleDrop(component, event);
    },
    
	enterDragOperation: function (component, event, helper) {
		helper.enterDragOperation(component);
	},
	
	exitDragOperation: function (component, event, helper) {
		helper.exitDragOperation(component);
	},
	
	fireDragEnter: function (component, event, helper) {
		var params = event.getParam("arguments");
		var target = $A.util.isUndefinedOrNull(params.target) ? component.getElement() : params.target;
		helper.fireDragEnter(component, target, params.isInAccessibilityMode);
	},
	
	fireDragLeave: function (component, event, helper) {
		var params = event.getParam("arguments");
		var target = $A.util.isUndefinedOrNull(params.target) ? component.getElement() : params.target;
		helper.fireDragLeave(component, target, params.isInAccessibilityMode);
	},
	
	fireDrop: function (component, event, helper) {
		var params = event.getParam("arguments");
		$A.util.forEach(params.dragComponents, function(dragComponent) {
			if (dragComponent.isValid()) {
				var dataTransfer = dragComponent.getConcreteComponent().getDef().getHelper().getDataTransfer(dragComponent, event);
				var target = $A.util.isUndefinedOrNull(params.target) ? component.getElement() : params.target;
				helper.fireDrop(component, dragComponent.get("v.type"), dataTransfer, dragComponent, target, params.isInAccessibilityMode);
			}	
		});
	}
})// eslint-disable-line semi