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
	// The test relies on clearing the cache, if another portion of the test relies on that not happening
	// you could get inconsistent test results.
	labels : [ "threadHostile" ],

	testComponentClassDefNotSerialized : {
		test: function(cmp) {
			cmp.makeRequestToServer();
			$A.test.addWaitFor(true, function() {
					return cmp.requestComplete;
				}, function() {
					var actual = $A.componentService.getComponentClass("auradev:componentClass");
					$A.test.assertUndefined(actual);
				}
			);
		}
	}
		
})