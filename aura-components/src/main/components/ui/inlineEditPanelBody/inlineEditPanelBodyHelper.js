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
	submit : function(cmp) {
		var value = cmp.get("v.inputComponent")[0].get("v.value");
		var key = cmp.get("v.key");
		var index = cmp.get("v.index");

		cmp.get("e.submit").setParams({
			payload : {
				index : index,
				key : key,
				value : value
			}
		}).fire();
	}
})// eslint-disable-line semi