({
    assertIsSecureElement: function(testUtils, element, message) {
        var secureElementRegex = /^SecureElement: \[.*\]{ key: {"namespace":"lockerlwc"} }$/
        testUtils.assertTrue(secureElementRegex.test(element.toString()), message);
    }
})