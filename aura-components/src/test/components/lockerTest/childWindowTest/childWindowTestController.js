({
    testClosedProperty: function (cmp) {
        var testUtils = cmp.get("v.testUtils");

        var childWindow = window.open("/lockerApiTest/index.app?aura.mode=DEV");
        testUtils.assertFalse(childWindow.closed, "Expected child window's 'closed' property to be false");
        childWindow.close();
        testUtils.assertTrue(childWindow.closed, "Expected child window's 'closed' property to be true");
    }
})