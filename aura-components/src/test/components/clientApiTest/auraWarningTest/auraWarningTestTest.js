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
    },

    testLogWarningWithError: {
        auraWarningsExpectedDuringInit: ["Expected warning from auraWarningTestController init"],
        test: function(cmp) {
            var warningMsg = "Expected warning from test";
            var errorMsg = "testing error message";
            var availableConsole = this.getAvailableConsole();
            var actualMsg;
            var actualError;

            $A.test.expectAuraWarning(warningMsg);
            var override = $A.test.overrideFunction(window["console"], availableConsole, function(format, message) {
                    // "console" uses particular format to create log message.
                    // Referring to the implementation of devDebugConsoleLog in Logger.js
                    // to mock the function.
                    if(format === "%s") {
                        actualMsg += message;
                    } else if(format === "%o") {
                        actualError = message;
                    } else {
                        $A.test.fail("Unexpected logging format string: " + format);
                    }
                });
            $A.test.addCleanup(function() { override.restore() });

            $A.warning(warningMsg, new Error(errorMsg));

            // we got more warnings in IE
            $A.test.assertTrue(actualMsg.indexOf(warningMsg) > -1,
                    "Expected warning message didn't get logged: " + actualMsg);
            $A.test.assertTrue(actualError instanceof Error);
            $A.test.assertEquals(errorMsg, actualError.message);
        }
    },

    testLogWarningWithDomException: {
        auraWarningsExpectedDuringInit: ["Expected warning from auraWarningTestController init"],
        test: function(cmp) {
            var warningMsg = "Expected warning from test";
            var availableConsole = this.getAvailableConsole();
            var actualMsg;
            var actualError;

            $A.test.expectAuraWarning(warningMsg);
            var override = $A.test.overrideFunction(window["console"], availableConsole, function(format, message) {
                    // "console" uses particular format to create log message.
                    // Referring to the implementation of devDebugConsoleLog in Logger.js
                    // to mock the function.
                    // debugger;
                    if(format === "%s") {
                        actualMsg += message;
                    } else if(format === "%o") {
                        actualError = message;
                    } else {
                        $A.test.fail("Unexpected logging format string: " + format);
                    }
                });
            $A.test.addCleanup(function() { override.restore() });

            // Cannot instantiate a DOMException, so force and catch one
            try {
                document.querySelectorAll("div:notExisted");
            } catch(e) {
                $A.warning(warningMsg, e);
            }

            $A.test.assertTrue(actualError instanceof DOMException,
                    "Expecting a SyntaxError:" + actualError);

            // IE uses %s to log stack trace
            if($A.util.isUndefined(actualError.stack)) {
                $A.test.assertTrue(actualMsg.length > 150,
                    "Failed to find stack track in the error: " + actualMsg);
            } else {
                $A.test.assertFalse($A.util.isEmpty(actualError.stack),
                    "Failed to find stack track in the error: " + actualError.stack);
            }
        }
    },

    /**
     * Aura logs to different spots depending on what's available on the current browser. Mimic logic in
     * Logging.js#devDebugConsoleLog to determine where logs will be sent.
     */
    getAvailableConsole: function() {
        var availableConsole;
        if (window["console"] && window["console"]["warn"]) {
            availableConsole = "warn";
        } else if (window["console"] && window["console"]["debug"]) {
            availableConsole = "debug";
        } else if (window["console"] && window["console"]["log"]) {
            availableConsole = "log";
        }
        return availableConsole;
    }
})
