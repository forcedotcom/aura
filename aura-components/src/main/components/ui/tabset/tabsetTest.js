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
	testClearingTabs: {
		test: function(cmp) {
			// Add, Clear
            cmp.get("e.addTab").fire({ tab: { "title": "testInitialTab" } });
			cmp.get("e.clearTabs").fire();

			// Verify tabs length is 0
			$A.test.assertEquals(0, cmp._tabCollection.getSize());
		}
	},

	testAddAfterClearTabs: {
		test: function(cmp) {
			// Add, clear, Add
            cmp.get("e.addTab").fire({ tab: { "title": "testAddInitial" } });
			cmp.get("e.clearTabs").fire();
            cmp.get("e.addTab").fire({ tab: { "title": "testAddAfter" } });

            // Verify
			$A.test.assertEquals(1, cmp._tabCollection.getSize());
		}
	},

	testDelayedClearTabs: {
		test: function(cmp) {
			var waiting = true;

			// Add, Clear
            cmp.get("e.addTab").fire({ tab: { "title": "testInitialTab" } });
			cmp.get("e.clearTabs").fire();

			$A.test.addWaitFor(false, function() {
				return !waiting;
			}, function(){
            	cmp.get("e.addTab").fire({ tab: { "title": "testPostWaitTab" } });
				// Verify tabs length is 1
				$A.test.assertEquals(1, cmp._tabCollection.getSize());
			});

			setTimeout(function() {
				waiting = false;
			}, 100);
		}

	}
/*eslint-disable semi*/
})
/*eslint-enable semi*/
