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
	handleItemsChange: function (cmp, params) {
		var concrete = cmp.getConcreteComponent(),
			sync = cmp.get('v.sync');

		if (!concrete._resetting && sync) {
			this.handleWrite(cmp);
		}
	},

	handleWrite: function (cmp) {
		var items 			= cmp.get('v.items'),
			defaultFields 	= cmp.get('v.defaultFields'),
			cfg  			= {},
			item, list;

		// Break appart operations into a separate lists on a single config object.
		for (var i = 0; i < items.length; i++) {
			item = items[i];

			if (!item || !item.operation) {
				return $A.error('Invalid data format. Specify the desired operation.');
			}

			if (defaultFields) {
				for (var f in defaultFields) {
					
					// Copy defaultFields onto item object if not set.
					if (!item[f]) {
						item[f] = defaultFields[f];
					}
				}
			}

			if (!cfg[item.operation]) { 
				cfg[item.operation] = []; 
			}

			cfg[item.operation].push(item.record);
		}

		// Delegate actual server action to concrete implementation.
		// Run appropriate actions based on the response. 
		this.write(cmp.getConcreteComponent(), cfg, function (err, data) {
			if (err) { 
				cmp.get('e.onerror').setParams({ value: { error: err, items: items } }); 
			}
			else {
				cmp.get('e.onsuccess').setParams({ value: { data: data, items: items } });
			} 
		});
	},

	/**
	 * Implement write logic in a concrete helper.
	 *
	 * @param {Component} concrete 
	 * @params {Object} cfg { operation => [] }
	 * @params {Function} callback optional callback to invoker of write operation function (error, response)
	 */
	write: function (concrete, cfg, callback) {
		$A.error('Unimplemented function! dataWriterHelper#write should be implemented in a concrete helper.');
	}
})