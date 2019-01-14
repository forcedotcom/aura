({
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    testLightningElementSyncWithLockerWrapper: {
        test: function(cmp) {
            cmp.secureLightningElementTester("testLightningElementSyncWithLockerWrapper");
        }
    },

    testBlacklistedProperties: {
        test: function(cmp) {
            cmp.secureLightningElementTester("testBlacklistedProperties");
        }
    },

    testLightningElementQuerySelector: {
        test: function(cmp) {
            cmp.secureLightningElementTester("testLightningElementQuerySelector");
        }  
    },

    testLightningElementQuerySelectorAll: {
        test: function(cmp) {
            cmp.secureLightningElementTester("testLightningElementQuerySelectorAll");
        }  
    },

    // TODO: Enable Test! LWC Error!
    _testLightningElementGetElementsByTagName: {
        test: function(cmp) {
            cmp.secureLightningElementTester("testLightningElementGetElementsByTagName");
        }  
    },

    // TODO: Enable Test! LWC Error!
    _testLightningElementGetElementsByClassName: {
        test: function(cmp) {
            cmp.secureLightningElementTester("testLightningElementGetElementsByClassName");
        }  
    }
})
