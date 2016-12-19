({
	/**
	 * aura:iteration will inevitably modify the shape of the ComponentDefRef provided as its body.
	 * It does this to maintain the "closure" nature provided by the Aura "templating engine".
	 * 
	 * This test verifies that the original ComponentDefRef remain untouched (attributes is correctly protected).
	 */
	testNoChangesToDefRef: {
		
		attributes: {
			items : ['Foo', 'Bar', 'Baz']
		},
		
		test: function (cmp) {
			var cdr = cmp.get('v.cdr');
			
			// Check for the PassthroughValue appended by aura:iteration. It should NOT be there.
			

			// NOT A VALID TEST. We do setup the valueProvider on the attributes in the framework. 
			// Not sure if there is a different test we want to do here. 
			//$A.test.assertUndefinedOrNull(cdr[0].attributes.valueProvider, "Iteration should not be able to mutate the attributes of the original ComponentDefRef.");

			$A.test.assertUndefinedOrNull(cdr[0].attributes.values.body.value[0].attributes.valueProvider, "Iteration should not be able to mutate the attributes of the original ComponentDefRef.");
		}
	}
})