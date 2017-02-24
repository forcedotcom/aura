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
	handleRegistration: function(cmp, event) {
		var sourceComponentId = event.getParam('sourceComponentId');
		if ($A.util.isUndefinedOrNull(sourceComponentId)) {
			return;
		}

		var sourceComponent = $A.componentService.get(sourceComponentId);
		if (sourceComponent && sourceComponent.isInstanceOf("ui:hasManager")) {
			sourceComponent.registerManager(cmp.getGlobalId());
		}
	},

	handleShowDatePicker: function (cmp, evt) {
		if (!cmp.get("v.loadDatePicker")) {
			cmp.set("v.loadDatePicker", true);
		}

		var datePicker = cmp.find('datePicker'),
			params = evt.getParams();

		// if the datepicker for the same source component is still being displayed, then just re-focus if necessary
		var isSameSourceComponent = cmp._sourceComponentId === params.sourceComponentId;
		if (datePicker.get("v.visible") === true && isSameSourceComponent && params.focusDatePicker) {
			datePicker.focus();
			return;
		}

		// Keep reference to the source component's globalId.
		cmp._sourceComponentId = params.sourceComponentId;

		if (params.toggleVisibility) {
            datePicker.show(params.value, params.focusDatePicker, params.element);
		}
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