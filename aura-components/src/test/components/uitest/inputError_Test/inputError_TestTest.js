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
    STATUS_ERROR: "Has Error",
    STATUS_CLEAR: "No Error",
    ERR_CSS: "has-error",
    ERR_MSG: "Error Happens!",

    /**
     * Test error handling from server errors.
     */
    testServerError: {
        attributes: {errorType: "native"},
        test: [function(cmp) {
            this.induceError(cmp, "errorServer", this.ERR_MSG);
        }, function(cmp) {
            this.clearError(cmp, "clearErrors");
        }]
    },

    /**
     * Test error handling setting and clearing errors without firing error events
     * by setting v.errors attribute
     */
    testErrorWithoutEvents: {
        attributes: {errorType: "native"},
        test: [function(cmp) {
            this.induceError(cmp, "errorNoEvent", this.ERR_MSG);
        }, function(cmp) {
            this.clearError(cmp, "clearErrors");
        }]
    },

    /**
     * Test error handling without setting error message
     */
    testErrorWithoutSettingErrorMessage: {
        attributes: {errorType: "native"},
        test: [function(cmp) {
            this.induceError(cmp, "errorNoErrMsg", "");
        }, function(cmp) {
            this.clearError(cmp, "clearErrors");
        }]
    },

    /**
     * Test error handling setting a custom error component.
     */
    testServerErrorUsingCustomErrorComponent: {
        attributes: {errorType: "custom"},
        test: [function(cmp) {
            this.induceError(cmp, "errorFireOnErrorEvent", "Custom Error Msg: " + this.ERR_MSG);
        }, function(cmp) {
            this.clearError(cmp, "clearFireOnClearErrrorsEvent");
        }]
    },

    /*******************************************
     * Helper Functions
     *******************************************/

    /**
     * 1. Click errorBtn to create error
     * 2. Wait for status to change to error
     * 3. Verify error message and css
     */
    induceError: function(cmp, errorBtnId, errMsg) {
        var self = this;
        cmp.find(errorBtnId).getElement().click();
        self.waitForOutputStatus(cmp, self.STATUS_ERROR, function() {
            self.verifyErrorMessage(true, errMsg);
            self.verifyErrorCss(true, cmp);
        });
    },

    /**
     * 1. Click clearBtn to clear error
     * 2. Wait for status to change to clear
     * 3. Verify error message and css
     */
    clearError: function(cmp, clearBtnId) {
        var self = this;
        cmp.find(clearBtnId).getElement().click();
        self.waitForOutputStatus(cmp, self.STATUS_CLEAR, function() {
            self.verifyErrorMessage(false);
            self.verifyErrorCss(false, cmp);
        });
    },

    /**
     * Spawning error message can be async (from server), so we
     * should just use output status as a change indicator
     */
    waitForOutputStatus: function(cmp, expectedStatus, callback) {
        var statusElm = cmp.find("outputStatus").getElement();
        $A.test.addWaitFor(expectedStatus, function() {
            return $A.test.getText(statusElm);
        }, callback);
    },

    verifyErrorMessage: function(hasError, expectedErrorMsg) {
        var errorElm = $A.test.select(".uiInputDefaultError")[0];
        if (hasError) {
            $A.test.assertNotUndefinedOrNull(errorElm,
                    "Error message expected but not found");

            var actualErrorMsg = $A.test.getText(errorElm);
            $A.test.assertEquals(expectedErrorMsg, actualErrorMsg,
                    "Incorrect error message: " + actualErrorMsg);
        } else {
            $A.test.assertUndefinedOrNull(errorElm,
                    "Did not expect to have error message");
        }
    },

    verifyErrorCss: function(hasError, cmp) {
        var inputElm = cmp.find("inputCmp").getElement();
        var hasErrClass = $A.util.hasClass(inputElm, this.ERR_CSS);
        if (hasError) {
            $A.test.assertTrue(hasErrClass, "On input error css not added");
        } else {
            $A.test.assertFalse(hasErrClass, "On input error css should not be present");
        }
    }
})
