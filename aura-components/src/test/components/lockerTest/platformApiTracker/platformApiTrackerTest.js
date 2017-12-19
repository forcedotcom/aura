({
    // API exposure should be consistent across all browsers
    browsers: ["GOOGLECHROME"],

    // ***Note***: Please do not update this list without consulting the LockerService team first!
    // APIs exposed in LockerService that are not marked @platform in the framework
    extrasWhitelist: {
            "$A": ["toString", "util", "localizationService"],

            // getCallback - to be deprecated/removed on Framework
            "Action": ["toString", "getCallback"],

            // generateLockerApiMap - specific to this test cmp, not part of framework itself
            // *render apis - temporary workaround, will be deprecated soon and not documented intentionally
            "Component": ["toString", "generateLockerApiMap", "superRender", "superAfterRender", "superRerender",
                          "superUnrender", "isRendered"],

            "Event": ["toString"]
    },

    // ***Note***: Please do not update this list without consulting the LockerService team first!
    // APIs marked @platform but intentionally excluded from being exposed in LockerService
    missingWhitelist: {
            // TODO: getToken and set - framework still deciding whether to fully expose or not
            "$A": ["error", "newCmp", "newCmpAsync", "run", "getToken", "set"]
    },

    testPlatformApis: {
        test: function(cmp) {
            var that = this;
            var completed = false;
            cmp.generateLockerApiMap();
            var lockerApiMap = cmp.get("v.apiMap");
            var action = cmp.get("c.getPlatformApis");
            action.setCallback(this, function(a) {
                if (a.getState() === "SUCCESS") {
                    var platformApiMap = a.getReturnValue();
                    that.compareApis(lockerApiMap, platformApiMap);
                    completed = true;
                } else {
                    var message = "Error retrieving list of @platform APIs from server.\n";
                    message += "Verify JsDoc was generated before running this test (build Aura without the -DskipJsDoc flag).\n";
                    message += "Error from server: \n";
                    message += a.getError()[0].message;
                    $A.test.fail(message);
                }
            });
            $A.enqueueAction(action);
            $A.test.addWaitForWithFailureMessage(true, function() { return completed }, "Timed out waiting for test to complete");
        }
    },

    compareApis: function(lockerApis, platformApis) {
        var failMessage = "";

        for (var name in platformApis) {
            var extraInLocker = this.getDiff(lockerApis[name], platformApis[name]);
            var missingInLocker = this.getDiff(platformApis[name], lockerApis[name]);

            // remove whitelisted items
            extraInLocker = this.getDiff(extraInLocker, this.extrasWhitelist[name]);
            missingInLocker = this.getDiff(missingInLocker, this.missingWhitelist[name]);

            if (extraInLocker.length > 0) {
                failMessage += "API(s) exposed in Locker not @platform on `" + name + "`: " + extraInLocker.toString() + "\n";
            }
            if (missingInLocker.length > 0) {
                failMessage += "@platform API(s) not exposed in Locker on `" + name + "`: " + missingInLocker.toString() + "\n";
            }
        }
        // fail the test if there wasn't parity between @platform APIs and what Locker exposes
        if (failMessage !== "" ) {
            $A.test.fail(failMessage);
        }
    },

    // return items in arr1 that are not present in arr2
    getDiff: function(arr1, arr2) {
        arr1 = arr1 || [];
        arr2 = arr2 || [];
        return arr1.filter(function(i) {
            return arr2.indexOf(i) < 0;
        });
    }
})
