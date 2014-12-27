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
/**
 * Automation to test $A.warning() only fails a test when expected.
 */
({
    failOnWarning: true,

    /**
     * This case inherits the suite level failOnWarning so we need to declare auraWarningsExpectedDuringInit to account 
     * for warning in the controller's init function and have $A.test.expectAuraWarning for any warnings in the test
     * block itself.
     */
    testExpectedWarning: {
        auraWarningsExpectedDuringInit: ["Expected warning from auraWarningTestController init"],
        test: function(cmp) {
            var warningMsg = "Expected warning from testExpectedWarning";
            var warningMsg2 = "Expected warning from testExpectedWarning2";
            $A.test.expectAuraWarning(warningMsg);
            $A.test.expectAuraWarning(warningMsg2);
            $A.warning(warningMsg);
            $A.warning(warningMsg2);
        }
    },

    /**
     * Override suite level failOnWarning and verify test does not fail on warnings.
     */
    testNoFailOnWarning: {
        failOnWarning: false,
        test: function(cmp) {
            $A.warning("Expected warning from testNoFailOnWarning");
        }
    }
})