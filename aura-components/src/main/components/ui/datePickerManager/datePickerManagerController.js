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
		var datePicker = cmp.find('datePicker'),
			el = datePicker.getElement(),
			params = evt.getParams(),
			box = params.element.getBoundingClientRect(),
			scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
			scrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;

		// Position datePicker.
		// Using scrollTop & scrollLeft for IE support; avoid window.scrollY & window.scrollX.
		el.style.top = box.bottom + scrollTop + 'px';
		el.style.left = box.left + scrollLeft + 'px';

		// Keep reference to onselected callback.
		cmp._onselected = params.onselected;

		// Set value and show datePicker.
		datePicker.set('v.value', params.value);
		datePicker.set('v.visible', true);
	},

	handleDateSelected: function (cmp, evt) {
		var selected = cmp._onselected;

		// Invoke onselected if it's a function; otherwise, assume Aura.Action.
		if (selected && $A.util.isFunction(selected)) {
			selected.call({}, evt);
		}
		else if (selected.auraType === 'Action') {
			selected.runDeprecated(evt);
		}
	}
})