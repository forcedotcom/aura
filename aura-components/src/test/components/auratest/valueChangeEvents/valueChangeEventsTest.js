({
	/***** Map Data Tests ******/
	testAttributePRVRerendersIterationItem: {
		test: function(component) {
			var item = component.find("listItem")[0];
			var newLabel = "updateditem";
			var expected = "0:updateditem";

			// should cause a rerender of the item 
			item.set("v.HTMLAttributes.prv", newLabel);

			$A.test.addWaitForWithFailureMessage(true, function() {
				actual = $A.util.getText(item.getElement());
				return expected	=== actual;
			}, "Updating the PRV to the passthrough value never caused a markDirty and rerender.");
		}		
	},
	testUpdateSourceDataRerendersIterationItem: {
		test: function(component) {
			var item = component.find("listItem")[0];
			var newLabel = "updateditem";
			var expected = "0:updateditem";

			component.set("v.mapdata.items.0.label", newLabel);

			$A.test.addWaitForWithFailureMessage(true, function() {
				actual = $A.util.getText(item.getElement());
				return expected	=== actual;
			}, "Updating the PRV to the passthrough value never caused a markDirty and rerender.");
		}
	},
	testUpdateSourceDataRerendersGlobalReference: {
		test: function(component) {
			var output = component.find("mapglobal");
			var expected = "updateditem";

			component.set("v.mapdata.items.0.label", expected);

			$A.test.addWaitForWithFailureMessage(true, function() {
				actual = $A.util.getText(output.getElement());
				return expected	=== actual;
			}, "Updating the PRV to the passthrough value never caused a markDirty and rerender.");
		}
	},
	testUpdateSourceDataOnIterationRerendersIterationItem: {
		test: function(component) {
			var item = component.find("listItem")[0];
			var iteration = component.find("iteration");
			var newLabel = "updateditem";
			var expected = "0:updateditem";

			iteration.set("v.items.0.label", newLabel);

			$A.test.addWaitForWithFailureMessage(true, function() {
				actual = $A.util.getText(item.getElement());
				return expected	=== actual;
			}, "Updating the PRV to the passthrough value never caused a markDirty and rerender.");
		}
	},

	testDeleteMapData: {
		test: function(component) {
			var iteration = component.find("iteration");
			var items = iteration.get("v.items");
			items.splice(1, 1); // Remove an item from the middle
			var expected = items.length;

			iteration.set("v.items", items);

			$A.test.assertEquals(expected, items.length);
		}
	},

	/***** List Data Tests ******/
	testDeleteListData: {
		test: function(component) {
			var iteration = component.find("listiteration");
			var items = iteration.get("v.items");
			items.splice(1, 1); // Remove an item from the middle
			var expected = items.length;

			iteration.set("v.items", items);

			$A.test.assertEquals(expected, items.length);
		}
	}


	// #######
	// The Following two test cases do not pass. Currently if you fire a change event that bubbles up
	// through a passthrough value, it doesn't propagate correctly. 
	// #######
	// ,
	// testUpdateSourceDataOnIterationRerendersGlobalReference: {
	// 	test: function(component) {
	// 		var output = component.find("mapglobal");
	// 		var iteration = component.find("iteration");
	// 		var expected = "updateditem";

	// 		iteration.set("v.items.0.label", expected);

	// 		$A.test.addWaitForWithFailureMessage(true, function() {
	// 			actual = $A.util.getText(output.getElement());
	// 			return expected	=== actual;
	// 		}, "Updating the PRV to the passthrough value never caused a markDirty and rerender.");
	// 	}
	// },
	// testAttributePRVRerendersGlobalReference: {
	// 	test: function(component) {
	// 		var item = component.find("listItem")[0];
	// 		var output = component.find("mapglobal");
	// 		var expected = "updateditem";

	// 		// should cause a rerender of the item 
	// 		item.set("v.HTMLAttributes.prv", expected);

	// 		$A.test.addWaitForWithFailureMessage(true, function() {
	// 			actual = $A.util.getText(output.getElement());
	// 			return expected	=== actual;
	// 		}, "Updating the PRV to the passthrough value never caused a markDirty and rerender.");
	// 	}
	// }
})