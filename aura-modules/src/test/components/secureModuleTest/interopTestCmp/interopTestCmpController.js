({
    testNonLockerizedModuleLibFromAnotherNamespaceIsSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("module-lib");

        testUtils.assertStartsWith("SecureComponentRef", secureComponentRef.toString(),
            "Module lib from another namespace should surface as SecureComponentRef");
    },

    testNonLockerizedModuleComponentFromAnotherNamespaceIsSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("module-cmp");

        testUtils.assertStartsWith("SecureComponentRef", secureComponentRef.toString(),
            "Module component from another namespace should surface as SecureComponentRef");
    },

    testLockerizedModuleLibFromAnotherNamespaceIsSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("lockerized-lib");

        testUtils.assertStartsWith("SecureComponentRef", secureComponentRef.toString(),
            "Lockerized module lib from another namespace should surface as SecureComponentRef");
    },

    testLockerizedModuleComponentFromAnotherNamespaceIsSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("lockerized-cmp");

        testUtils.assertStartsWith("SecureComponentRef", secureComponentRef.toString(),
            "Lockerized module component from another namespace should surface as SecureComponentRef");
    },

    testLockerizedModuleLibFromSameNamespaceIsSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponent = cmp.find("sibling-lib");

        testUtils.assertStartsWith("SecureComponent:", secureComponent.toString(),
            "Lockerized module lib from same namespace should surface as SecureComponent");
    },

    testLockerizedModuleComponentFromSameNamespaceIsSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponent = cmp.find("sibling-cmp");

        testUtils.assertStartsWith("SecureComponent:", secureComponent.toString(),
            "Lockerized module component from same namespace should surface as SecureComponent");
    },

    testPublicMethodsOnSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var moduleLib = cmp.find("sibling-lib");
        testUtils.assertEquals(5, moduleLib.addition(2, 3));
        var moduleCmp = cmp.find("sibling-cmp");
        testUtils.assertEquals(-1, moduleCmp.subtract(2, 3));
    },

    testPublicMethodsOnSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var moduleLib = cmp.find("module-lib");
        var value = "Hello module";
        testUtils.assertEquals(value, moduleLib.identity(value));

        var moduleCmp = cmp.find("module-cmp");
        testUtils.assertEquals("Test method!", moduleCmp.test());

        var lockerizedLib = cmp.find("lockerized-lib");
        testUtils.assertEquals(4, lockerizedLib.multiply(2, 2));

        var lockerizedCmp = cmp.find("lockerized-cmp");
        testUtils.assertEquals(1, lockerizedCmp.divide(2, 2));
    }
})
