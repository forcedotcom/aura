/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    testResetTokenSavesTokenToStorage : {
        // CSRF is only stored in persistent storage. indexedDB is not supported on Safari,
        // so persistent storage is not able to be created on Safari.
        browsers: ["-SAFARI", "-IPAD", "-IPHONE"],
        test: function(cmp) {
            // Arrage
            var expected = "myToken";
            var actual;

            var storage = $A.storageService.getStorage("actions");
            $A.test.assertNotUndefinedOrNull(storage, "Storage 'actions' is required for the test");
            $A.test.assertTrue(storage.isPersistent(), "CSRF token is only stored into persistent storage");

            // Act
            $A.clientService.resetToken(expected);

            // Assert
            // Key from AuraClientService.TOKEN_KEY
            var key = "$AuraClientService.token$";

            // Verify the token in storage gets updated
            function checkTokenInStorage() {
                // short-circuit once the test times out
                if ($A.test.isComplete()) {
                    return;
                }

                storage.adapter.getItems([key])
                    .then(function(items) {
                        if(items[key]) {
                            actual = items[key].value.token;
                        } else {
                            setTimeout(function() { checkTokenInStorage(); }, 100);
                        }
                    })
                    .catch(function(e) {
                        $A.test.fail("Failed to get value from storage: " + e);
                    });
            };

            // resetToken saves token asynclly
            checkTokenInStorage();

            $A.test.addWaitFor(true, function() { return !!actual; },
                function() {
                    $A.test.assertEquals(expected, actual, "Failed to find expected token");
                });
        }
    }
})
