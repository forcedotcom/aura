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
	handleDragStart: function (component, event, helper) {
		helper.handleDragStart(component, event);
	},
	
	handleDragEnd: function (component, event, helper) {
		helper.handleDragEnd(component, event);
	},
	
	handleKeyPress: function (component, event, helper) {
		helper.handleKeyPress(component, event);
	},
	
	handleDropComplete: function (component, event, helper) {
		helper.handleDropComplete(component, event);
	},
	
	setDropStatus: function (component, event, helper) {
		var params = event.getParam("arguments");
		if (component.$dragOperation$) {
			component.$dragOperation$.$dropOperationStatus$.setDropStatus(params.isSuccessful);
		}
	},
	
	fireDragEnd: function (component, event, helper) {
		var params = event.getParam("arguments");
		var target = $A.util.isUndefinedOrNull(params.target) ? component.getElement() : params.target;
		helper.fireDragEnd(component, target, params.isValid, params.isInAccessibilityMode);
	}
})// eslint-disable-line semi