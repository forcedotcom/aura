({
	verifyStorage : function(cmp, storage, storageType) {
		var testUtils = cmp.get("v.testUtils");
		var verifyRawStorage = cmp.get("v.verifyRawStorage");

		// First check that the methods we expect have been exposed
		var expected = [ "length", "key", "getItem", "setItem", "removeItem", "clear" ];
		Object.keys(storage).forEach(function(name) {
			testUtils.assertTrue(expected.indexOf(name) >= 0, "Unexpected " + storageType + "." + name + " exposed as a property or method");
			testUtils.assertTrue(name in storage, "Expected " + storageType + "." + name + " to be exposed as a property or method");
		});

		testUtils.assertEquals(0, storage.length);
		verifyRawStorage(storageType, null, null);

		// Add a new value
		storage.setItem("foo", "bar");
		testUtils.assertEquals(1, storage.length);
		testUtils.assertEquals("bar", storage.getItem("foo"));
		testUtils.assertEquals("foo", storage.key(0));
		verifyRawStorage(storageType, "2", "{\"foo\":1}");

		// Modify an existing value
		storage.setItem("foo", "bar2");
		testUtils.assertEquals(1, storage.length);
		testUtils.assertEquals("bar2", storage.getItem("foo"));
		verifyRawStorage(storageType, "2", "{\"foo\":1}");

		// Add a second value and insure that the existing value is not impacted
		storage.setItem("x", "y");
		testUtils.assertEquals(storage.length, 2);
		testUtils.assertEquals("y", storage.getItem("x"));
		testUtils.assertEquals("foo", storage.key(0));
		testUtils.assertEquals("x", storage.key(1));
		verifyRawStorage(storageType, "3", "{\"foo\":1,\"x\":2}");
		
		// Remove the first item
		storage.removeItem("foo");
		testUtils.assertEquals(1, storage.length);
		testUtils.assertEquals("y", storage.getItem("x"));
		testUtils.assertEquals("x", storage.key(0));
		testUtils.assertEquals(undefined, storage.key(1));
		verifyRawStorage(storageType, "3", "{\"x\":2}");

		// Clear the entire storage
		storage.clear();
		testUtils.assertEquals(0, storage.length);
		verifyRawStorage(storageType, "3", null);
	}
})