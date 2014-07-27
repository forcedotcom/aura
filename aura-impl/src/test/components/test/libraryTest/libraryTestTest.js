({
	/**
	 * Test ensuring that the imported module is loaded correctly and hung off of the helper with property name
	 * given in the cmp.
	 * 
	 * Additionally, tests that the Dependency was properly injected into the Test import and that the tp file was 
	 * appropriately wrapped and shimmed.
	 */
    testHelper: {
		test:function(cmp){
			var helper = cmp.getDef().getHelperDef().getFunctions();
			$A.test.assertDefined(helper.imported);
			$A.test.assertDefined(helper.imported.Dependency);
			$A.test.assertDefined(helper.imported.TestInclude);
			$A.test.assertDefined(helper.imported.tp);
			
			$A.test.assertEquals("TEST:DEPENDENCY", helper.imported.TestInclude());
			$A.test.assertEquals("I will become a shimmed library", helper.imported.tp());
		}
    }
})