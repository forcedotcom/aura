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
	afterRender: function(cmp, helper) {
		var options = cmp.get("v.options");

		if (!cmp.get("v.useMenu") && (!$A.util.isEmpty(options) || $A.util.isEmpty(cmp.get("v.body")))) {
			var optionElements = helper.renderOptions(cmp, options);

			cmp.find("select").getElement().appendChild(optionElements);
		}

		if (cmp.get("v.useMenu")) {
			var menuList = cmp.find("options").getElement();

			var triggerRect = cmp.find("selectTrigger").getElement().getBoundingClientRect();
			var width = typeof triggerRect.width !== 'undefined' ? triggerRect.width : triggerRect.right - triggerRect.left;
			menuList.style.width = width + "px";
			// In case the width exceeds the max width we want to still limit to the width of the trigger
			menuList.style.maxWidth = menuList.style.width;
		}

		this.superAfterRender();
	},

	rerender: function(cmp, helper) {
		var options = cmp.get("v.options");

		if (!cmp.get("v.useMenu") && (!$A.util.isEmpty(options) || $A.util.isEmpty(cmp.get("v.body")))) {
			var select = cmp.find("select").getElement();
			var optionElements = select.children;

			// Remove extra option elements
			while (optionElements.length > options.length) {
				select.removeChild(optionElements[options.length]);
			}

			// Update existing option elements with info from options array
			var index = 0;
			while (index < optionElements.length) {
				helper.updateOptionElement(cmp, options[index], optionElements[index]);
				index++;
			}

			// Create new option elements for the remaining options and add them to the DOM
			if (index < options.length) {
				var newElements = helper.renderOptions(cmp, options.slice(index));

				cmp.find("select").getElement().appendChild(newElements);
			}
		}

		this.superRerender();
	}
})// eslint-disable-line semi