({
	/**
	 * Find components defined as ComponentDefRefs using aura:id and qualified name
	 */
	testFindByQualifiedName:{
		test:[function(cmp){
			var stub = cmp.find("anyCmpAsStub");
			var buttons = stub.find({"instancesOf":"ui:button"});
			$A.test.assertFalse($A.util.isUndefinedOrNull(buttons));
			$A.test.assertTrue($A.util.isArray(buttons));
			$A.test.assertEquals(2, buttons.length);
			$A.test.assertEquals("Parrot", buttons[0].get("v.label"));
			$A.test.assertEquals("Peacock", buttons[1].get("v.label"));
			
			var text = stub.find({"instancesOf":"aura:text"});
			$A.test.assertFalse($A.util.isUndefinedOrNull(text));
			$A.test.assertEquals(1, text.length);
			$A.test.assertEquals("Parakeet",text[0].get("v.value"));
		}]
	}
})