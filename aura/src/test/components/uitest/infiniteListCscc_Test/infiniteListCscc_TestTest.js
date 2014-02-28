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
	/**
	 * Test able to grab and display more data from server.
	 */
	testDataFromServerDisplays : {
		attributes: {isGetDataFromServer : true},
		test: [function(cmp) {
			// waiting for intial items of list to load.
			$A.test.addWaitFor(25, function(){
				return cmp.find("list").get("v.items").length;
			});
		}, function(cmp) {
			// more items should be fetched and displayed.
			var btn = cmp.find("btnShowMore");
			btn.get("e.press").fire();			
			$A.test.assertEquals(false, cmp.get("v.isDoneRendering"), "isDoneRendering should be false.");
			$A.test.addWaitFor(50, function(){return cmp.find("list").get("v.items").length;}, function(){
				$A.test.assertEquals(true, cmp.get("v.isDoneRendering"), "isDoneRendering should be true.");
			});						
		}]
	}
})