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

    testRerenderGrandchildFacet: {
        test: [
            function rerenderTheDeepestAuraIf(cmp) {
                $A.test.clickOrTouch(cmp.find("toggleFour").getElement());

                // using wait method to trigger rerenderDirty
                $A.test.addWaitForWithFailureMessage("Four:true", function() {
                        var output = cmp.find("output").getElement();
                        return $A.test.getText(output);
                    },
                    "The forth AuraIf wasn't rerendered correctly");
            },
            function rerenderTheTopAuraIf(cmp) {
                $A.test.clickOrTouch(cmp.find("toggleOne").getElement());

                // toggle the top AuraIf to true, the subtree should be unrendered
                $A.test.addWaitForWithFailureMessage("One:true", function() {
                        var output = cmp.find("output").getElement();
                        return $A.test.getText(output);
                    },
                    "The forth AuraIf should be unrendered");
            }
        ]
    },

    testUnrenderExpressionDuringRerenderGrandchildFacet: {
        test: [
            function rerenderExpression(cmp) {
                $A.test.clickOrTouch(cmp.find("toggleFour").getElement());
                $A.test.clickOrTouch(cmp.find("rerenderAuraExpression").getElement());
                var text = null;

                $A.test.addWaitForWithFailureMessage(true, function() {
                        var output = cmp.find("output").getElement();
                        text = $A.test.getText(output);
                        return text.indexOf("Paragraph tag") > -1;
                    },
                    "Aura Expression is not rerendered correctly",
                    function verifyElementsOnTheDeepestAuraIf() {
                        $A.test.assertEqualsIgnoreWhitespace("Paragraph tag Four:true", text);
                    });
            },
            function rerenderTheDeepestAuraIf(cmp) {
                $A.test.clickOrTouch(cmp.find("toggleFour").getElement());

                $A.test.addWaitForWithFailureMessage("Four:false", function() {
                        var output = cmp.find("output").getElement();
                        return $A.test.getText(output);
                    },
                    "The forth AuraIf wasn't rerendered correctly");
            }
        ]
    },

    testAuraClassOnNewlyRenderedElementsFromGrandChildRerender: {
        test: [
            function rerenderExpressionOnDeepestAuraIf(cmp) {
                $A.test.clickOrTouch(cmp.find("toggleFour").getElement());
                $A.test.clickOrTouch(cmp.find("rerenderAuraExpression").getElement());

                $A.test.addWaitForWithFailureMessage(true, function() {
                        var output = cmp.find("output").getElement();
                        var text = $A.test.getText(output);
                        return text.indexOf("Paragraph tag") > -1;
                    },
                    "Aura Expression is not rerendered correctly",
                    function() {
                        var element = document.querySelector("div.renderingTestRerenderFacet p");
                        $A.test.assertTruthy(element, "Aura class was not applied to elements on Expression correctly");
                    });
            }
        ]
    }
})
