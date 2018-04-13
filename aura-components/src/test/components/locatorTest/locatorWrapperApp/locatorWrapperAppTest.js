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
    browsers: ['DESKTOP'],
    setUp: function (component) {
        // hookUp to the metrics service to capture transactions
        var thisTest = this;
        thisTest.lastTransaction = undefined;
        $A.metricsService.onTransactionEnd(function (t) {
            if (t.id === 'aura:interaction') {
                thisTest.lastTransaction = t;
            }
        });
    },
    clickDivAndGetTransaction: function (classSelector) {
        var elem = $A.test.select(classSelector)[0];
        $A.test.clickOrTouch(elem);
        return this.lastTransaction;
    },
    validateLocatorResult: function (actualLocator, expectedTarget, expectedScope, expectedContext) {
        var actualTarget = actualLocator.target;
        var actualScope = actualLocator.scope;
        var actualContext = actualLocator.context;
        
        $A.test.assertEquals(expectedTarget, actualTarget, "Target Mismatch");
        $A.test.assertEquals(expectedScope, actualScope, "Scope Mismatch");
        
        if (!expectedContext) {
            $A.test.assertUndefined(actualContext);
        } else {
            $A.test.assertEquals(Object.keys(expectedContext).length, Object.keys(actualContext).length, "Actual locator context didn't have the same number of keys")
            for (var prop in expectedContext) {
                $A.test.assertEquals(expectedContext[prop], actualContext[prop], "Found mismatch for locator context property: " + prop);
            }
        }
    },
    lastTransaction: {},
    testParentWithAuraIdLocatorChildRadio: {
        test: function (cmp) {
            this.clickDivAndGetTransaction($A.util.format(".{0} .{1}", "locatorWrapperIdWithDef", "innerRadio"));
            var that = this;
            $A.test.addWaitFor(true, function(){
                return !!that.lastTransaction;
            }, function () {
                var trx = this.lastTransaction;
                this.validateLocatorResult(trx.context.locator, "innerRadio__radio" /*target*/, "locatorWrapperIdWithDef" /*scope*/, 
                        {
                            "parentKey": cmp.find("target").get("v.wrapperText")
                        });
            });
        }
    }
    
})

