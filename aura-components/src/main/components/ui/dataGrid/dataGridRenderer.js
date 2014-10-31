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
	render: function (cmp, hlp) {
		var concrete 	= cmp.getConcreteComponent(),
			table 		= this.superRender(),
			tbody 		= cmp.find('tbody').getElement(),
			tfoot       = cmp.find('tfoot').getElement(),
			items 		= cmp.get('v.items'),
			summaryRow;

		// TODO: this seems stupid d[-_-]b
		cmp._loadedOnce = items.length > 0;

		// Build the table body. 
		// The DOM nodes are built synchronously, but the components are built asynchronously.
		tbody.appendChild(hlp.createTableBody(concrete));

		// Attempt to create a summary row.
		//summaryRow = hlp.createSummaryRow(concrete);

		if (summaryRow) {
			tfoot.appendChild(summaryRow);
		}
		cmp._rendered = true;
		return table;
	},
	
	unrender: function (cmp) {
		var children = cmp._allChildrenCmps,
			child;

		// Asynchronously destroy leaf (cell) components.
		for (var i = 0; i < children.length; i++) {
			child = children[i];
			child.destroy(true);
		}

		this.superUnrender();
	}
})