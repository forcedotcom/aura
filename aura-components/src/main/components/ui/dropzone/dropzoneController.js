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
	init: function (component, event, helper) {
		helper.resetCssClass(component);
	},
	
	enterDragOperation: function (component, event, helper) {
		helper.enterDragOperation(component);
	},
	
	exitDragOperation: function (component, event, helper) {
		helper.exitDragOperation(component);
	},
	
	fireDragEnter: function (component, event, helper) {
		var params = event.getParam("arguments");
		helper.fireDragEnter(component, component, params.isInAccessibilityMode);
	},
	
	fireDragLeave: function (component, event, helper) {
		var params = event.getParam("arguments");
		helper.fireDragLeave(component, component, params.isInAccessibilityMode);
	},
	
	fireDrop: function (component, event, helper) {
		var params = event.getParam("arguments");
		
		// Note: can only handle one dragComponent for now
		helper.fireDrop(component, params.dragComponents[0], component, params.isInAccessibilityMode);
	}
})