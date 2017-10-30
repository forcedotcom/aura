({
    testIntrinsicsAreFrozen: function (toTest, typeInString) {
        // TODO: Currently we only seal the prototype
        $A.test.assertTrue(Object.isSealed(toTest), "Expected " + typeInString + " to have been sealed");
        // $A.test.assertTrue(Object.isFrozen(toTest), "Expected " + typeInString + " to have been frozen`);
        $A.test.assertFalse(Object.isExtensible(toTest), "Expected " + typeInString + " to have be inextensible");
    }
})