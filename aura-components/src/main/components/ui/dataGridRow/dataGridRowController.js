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
	handleSelected: function (cmp, evt) {
		var item = cmp.get('v.row.item'),
			checked = evt.target.checked;

		cmp.setValue('v.row.selected', checked);	

		// Only fire select when there is a click involved.
		if (cmp.get('v.onselect')) {
			cmp.get('v.onselect').runDeprecated({ item: item, selected: checked });
		}
	},

	handleAction: function (cmp, evt) {
		var source = evt.getSource(),
			name = source && source.get('v.name'),
			item = cmp.get('v.row.item'),
			index = cmp.get('v.index');

		// Only fire select when there is a click involved.
		if (cmp.get('v.onaction')) {
			cmp.get('v.onaction').runDeprecated({ 
				name	: name, 
				index	: index,
				item	: item, 
				row		: cmp 
			});
		}
	},

	handleSelectedChange: function (cmp) {
		var selected = cmp.get('v.row.selected');
		cmp.find('checkbox').getElement().checked = selected;
	},

	handleItemChange: function (cmp, evt) {
		var rowSwap = cmp.get('v.row.rowSwap'),
			params, onitemchange;

		// If during row swap, ignore.
		if (!rowSwap) {
			params = evt.getParams();
			onitemchange = cmp.get('v.onitemchange');
			
			if (evt && onitemchange) {
				onitemchange.runDeprecated({ 
					column : params.index, 
					value  : params.value.getValue(),
					index  : cmp.get('v.index')
				});
			}
		}
	}
});