({
	/**
	 * Find components defined as ComponentDefRefs using aura:id and qualified name
	 */
	testFindWithComponentDefRefs:{
		test:[function(cmp){
			//Using aura:id
			var tiger = cmp.find("tiger");
			$A.test.assertFalse($A.util.isUndefinedOrNull(tiger));
			$A.test.assertEquals("Tiger", tiger.get("v.label"));
			
			var lion = cmp.find("lion");
			$A.test.assertFalse($A.util.isUndefinedOrNull(lion));
			$A.test.assertTrue($A.util.isArray(lion));
			$A.test.assertEquals("Lion", lion[0].get("v.label"));
			$A.test.assertEquals("Lioness", lion[1].get("v.label"));
			$A.test.assertEquals("Cub", lion[2].get("v.value"));
			
		},function(cmp){
			
			var ifFacet = cmp.find("singleElement");
			//Automation for W-1480326
			$A.test.assertEquals(0,ifFacet.find({"instancesOf":"ui:button"}).length);
		}]
	}
})