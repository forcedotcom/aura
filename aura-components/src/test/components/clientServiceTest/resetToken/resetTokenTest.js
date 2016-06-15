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
    testResetTokenNormalCase : {
        test: function(cmp) {
                var actual;
                var myToken = "myToken";

                $A.clientService.resetToken(myToken);

                var storage = $A.storageService.getStorage("actions");
                $A.test.assertNotUndefinedOrNull(storage);
                // Verify the token in storage gets updated
                var key = "$AuraClientService.token$";
                storage.adapter.getItems([key]).then(
                    function(items) {
                        if(items[key]) {
                            actual = items[key].value.token
                        }
                    }, function() {
                        $A.test.fail("Failed to get value from storage.");
                    });

                $A.test.addWaitFor(true, function() {
                        return typeof actual !== "undefined";
                    }, function() {
                        $A.test.assertEquals(myToken, actual);
                    });
            }
    }
})
