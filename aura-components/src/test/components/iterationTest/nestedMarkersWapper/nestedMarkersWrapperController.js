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
	init: function (cmp) {
            cmp._data = [ {
                 "changes": [
                   {
                     "fieldName": "Account Name",
                     "newValue": "Burlington Co of America",
                     "oldValue": "Burlington Corp of America"
                   },
                   {
                     "fieldName": "Annual Revenue",
                     "newValue": null,
                     "oldValue": "$500,000,000.00"
                   }
                ]},
                { "changes": [
                   {
                     "fieldName": "Description",
                     "newValue": "$700,000,000.00",
                     "oldValue": null
                   }
                ]}];
            cmp._data_swap = [ {
                 "changes": [
                   {
                     "fieldName": "2 - Account Name",
                     "newValue": "2 - Burlington Co of America",
                     "oldValue": "2 - Burlington Corp of America"
                   },
                   {
                     "fieldName": "2 - Description",
                     "newValue": "2 - $700,000,000.00",
                     "oldValue": null
                   },
                ]},
                { "changes": [
                   {
                     "fieldName": "2 - Annual Revenue",
                     "newValue": null,
                     "oldValue": "2 - $500,000,000.00"
                   }
                ]}];
            cmp._blipper = 'bah';
            
            ///
            /// - init
            ///
            cmp.set('v.data', { "elements":cmp._data, "other":1 });
            cmp.set('v._initialized', true);
	},
	changeValue : function (cmp) {
            cmp.set('v.blip', cmp._blipper);
            cmp._blipper = cmp._blipper+'!';
        },
	resetIter: function (cmp) {
            if (!cmp.isValid()) {
                return;
            }
            // give the same data, but clone to a new object to make the iteration deal with 'new' data
            var newData = cmp._data_swap;
            cmp._data_swap = cmp._data;
            cmp._data = newData;
            cmp.set('v.data.elements', newData);
            cmp._blipper = 'blech';
	}
})
