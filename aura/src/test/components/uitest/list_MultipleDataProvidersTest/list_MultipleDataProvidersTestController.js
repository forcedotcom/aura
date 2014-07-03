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
	getDP1Data: function(cmp, event, helper) {
		helper.refresh(cmp, 0);
	},
	
	getDP2Data: function(cmp, event, helper) {
		helper.refresh(cmp, 1);
	},
	
	getEmptyList: function(cmp, event, helper) {
		helper.refresh(cmp, 2);
	},
	
	getOutOfBound: function(cmp, event, helper) {
		helper.refresh(cmp, 100);
	},
	
	fireInline: function(cmp, event, helper) {
		var list = cmp.find("list");
		var providers = list.get("v.dataProvider");
		providers[3].get("e.provide").fire();
	}
})