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

	doInit: function(component, event, helper) {
		// Add some data to the "data" attribute to show in the iteration
		var mapdata = {
			items: [
				{ "label": "0"},
				{ "label": "1"},
				{ "label": "2"},
				{ "label": "3"},
				{ "label": "4"}
			]
		};
		component.set("v.mapdata", mapdata);
	},
})