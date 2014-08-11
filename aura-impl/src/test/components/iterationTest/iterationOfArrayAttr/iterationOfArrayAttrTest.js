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
	 * Verify that attribute of type List can be iterated over and display the right value.
	 */
	testInitialization : {
		test:function(cmp){
			var array = cmp.get("v.simpleListAttr");
			$A.test.assertEquals(4, array.length);
			var maps = cmp.get("v.listOfMapAttr")
			$A.test.assertEquals(2, maps.length);
			this.verifyExpectedItems(cmp, [1, 2, 3, 4], ["Tony", "Romo"]);
		}
	},
	/**
	 * Verify that clearing attribute of type List clears up iteration body.
	 */
	testClearListItems:{
		test:function(cmp){
			this.verifyExpectedItems(cmp, [1, 2, 3, 4], ["Tony", "Romo"]);
			$A.test.clickOrTouch(cmp.find("clear").getElement());
			$A.test.assertEquals(0, cmp.get("v.simpleListAttr").length);
			$A.test.assertEquals(0, cmp.get("v.listOfMapAttr").length);
			this.verifyExpectedItems(cmp, [], []);
		}
	},
	
	/**
	 * Verify that setting attribute of List type to new arrays will cause iteration to change page content. 
	 */
	testSetListItemsToNewArray:{
		test: function(cmp){
			this.verifyExpectedItems(cmp, [1, 2, 3, 4], ["Tony", "Romo"]);
			$A.test.clickOrTouch(cmp.find("change").getElement());
			this.verifyExpectedItems(cmp, [99,100,101,102,103], ["Tom", "Brady"]);
		}
	},
	
	/**
	 * Verify that clearing and setting an attribute of List type to new arrays will cause iteration to change page content. 
	 */
	testClearAndSetItemsToNewArray:{
		test:function(cmp){
			this.verifyExpectedItems(cmp, [1, 2, 3, 4], ["Tony", "Romo"]);
			$A.test.clickOrTouch(cmp.find("clear").getElement());
			this.verifyExpectedItems(cmp, [], []);
			$A.test.clickOrTouch(cmp.find("change").getElement());
			this.verifyExpectedItems(cmp, [99,100,101,102,103], ["Tom", "Brady"]);
		}
	},
	
	verifyExpectedItems: function(cmp, expectedSimpleItems, expectedMapItems){
		var expectedText = "";
		var simpleItems = cmp.find("simple");
		$A.test.assertEquals(expectedSimpleItems.length, simpleItems.get("v.items").length);
		$A.util.forEach(expectedSimpleItems, function(item){expectedText = expectedText+item});
		$A.test.assertEquals(expectedText, $A.test.getTextByComponent(simpleItems));
		
		var mapItems = cmp.find("listOfMap");
		$A.test.assertEquals(mapItems.get("v.items").length, expectedMapItems.length)
		expectedText = "";
		$A.util.forEach(expectedMapItems,function(item){expectedText = expectedText+item});
		$A.test.assertEquals(expectedText, $A.test.getTextByComponent(mapItems));
	}
})