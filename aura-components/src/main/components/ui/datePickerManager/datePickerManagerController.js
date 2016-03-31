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
	handleShowDatePicker: function (cmp, evt) {
		if (!cmp.get("v.loadDatePicker")) {
			cmp.set("v.loadDatePicker", true);
		}

		var datePicker = cmp.find('datePicker'),
			params = evt.getParams();

		// Keep reference to the source component's globalId.
		cmp._sourceComponentId = params.sourceComponentId;

		// Set value and show datePicker.
		var value = params.value;
		if (!$A.util.isUndefinedOrNull(value)) {
			datePicker.set('v.value', value);
		}
		datePicker.set("v.referenceElement", params.element);
		datePicker.set('v.visible', true);
	},

	handleDateSelected: function (cmp, evt) {
		var sourceComponentId = cmp._sourceComponentId;
		if ($A.util.isUndefinedOrNull(sourceComponentId)) {
			return;
		}

		var sourceComponent = $A.componentService.get(cmp._sourceComponentId);
		if (sourceComponent && sourceComponent.isInstanceOf("ui:handlesDateSelected")) {
			sourceComponent.onDateSelected(evt.getParam("value"));
		}
	}
})// eslint-disable-line semi