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
	handleClick: function (cmp, evt, helper) {
		var el = helper.getInputElement(cmp),
			domEvt = evt.getParam("domEvent"),
			click;

		// Dispatch clicks within the action as clicks on the action itself.
		// Ignore clicks coming from its own element, those events will bubble correctly.
		if (domEvt.target !== el) {
			domEvt.stopPropagation();

			click = new MouseEvent('click', {
				bubbles: true
			});

			el.dispatchEvent(click);
		}
	},

	handleValueChange: function (cmp, evt, helper) {
		var el = helper.getInputElement(cmp),
			value = evt.getParam('value');

		$A.util.setDataAttribute(el, 'action-value', value);
	}
})