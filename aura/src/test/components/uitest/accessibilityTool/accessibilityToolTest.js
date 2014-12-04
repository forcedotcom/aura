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
    //Excluding IE7/8 because this test will only work with modern browsers
    browsers: ["-IE7", "-IE8"],
    
        runTest: function (expected, errorMessage, element, testsToSkip) {
            var output = $A.devToolService.checkAccessibility(element, testsToSkip);
            var actual = 0;
            if(!$A.util.isEmpty(output)){
            	actual = output.trim().split("\n\n").length;
            }
           
            $A.test.assertEquals(expected, actual, errorMessage + output);
           
        },
        
        testTopPanelHidden : {
        	attributes: {
                caseToRender: 'testTopPanelHidden'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return errornous string. output: \n");
            }
        },

        testActiveTopPanelAriaHiddenIsTrue : {
        	attributes: {
                caseToRender: 'testActiveTopPanelAriaHiddenIsTrue'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should not return errornous string. output: \n");
            }
        },
        
        testBasePanelAriaHiddenIsFalse : {
        	attributes: {
                caseToRender: 'testBasePanelAriaHiddenIsFalse'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should not return errornous string. output: \n");
            }
        }, 
        
        testNoActiveTopPanelAriaHiddenOk : {
        	attributes: {
                caseToRender: 'testNoActiveTopPanelAriaHiddenOk'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return errornous string. output: \n");
            }
        }, 
        
        testNoActiveTopPanelBasePanelAriaHiddenIsTrue : {
        	attributes: {
                caseToRender: 'testNoActiveTopPanelBasePanelAriaHiddenIsTrue'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should not return errornous string. output: \n");
            }
        }, 
        
        testNoActiveTopPanelAriaHiddenNotExists: {
        	attributes: {
                caseToRender: 'testNoActiveTopPanelAriaHiddenNotExists'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should not return errornous string. output: \n");
            }
        },
      
        //This test is used for checking that we can conditionally skip checks
        testRunSpecificChecks: {
            attributes: {
                caseToRender: 'full'
            },
            test: [function (cmp) {
                    this.runTest(7, "Unexpected return from CheckAccessibility, should return 3 errors. output: \n", null, ["A11Y_DOM_02"]);
                },
                function (cmp) {
                    this.runTest(9, "Unexpected return from CheckAccessibility, should return 3 errors. output: \n", null, ["A11Y_DOM_06", "A11Y_DOM_02", "A11Y_DOM_08"]);
                }]
        },
        
        testMultiInputDefaultULToSingleInput :  {
        	attributes: {
                caseToRender: 'testMultiULToOne'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        
        testInputDefaultError : {
        	attributes: {
                caseToRender: 'testInputDefaultError'
            },
            test: function (cmp) {
            	cmp.find("inputErrorTest").find("validate").getEvent("press").fire({});
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testWithNoHeader: {
            attributes: {
                caseToRender: 'testWithNoHeader'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        testThWithScopeNoTD: {
            attributes: {
                caseToRender: 'testThWithScopeNoTD'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        testThWithIdNoTD: {
            attributes: {
                caseToRender: 'testThWithIdNoTD'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        testTableHeaderWithScope: {
            attributes: {
                caseToRender: 'testTableHeaderWithScope'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        testTHandTDtagsAssociateCorrectly: {
            attributes: {
                caseToRender: 'testTHandTDtagsAssociateCorrectly'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        testTDUsesWrongID: {
            attributes: {
                caseToRender: 'testTDUsesWrongID'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testTDWithOutHeaderAttrib: {
            attributes: {
                caseToRender: 'testTDWithOutHeaderAttrib'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testTableHeaderWoID: {
            attributes: {
                caseToRender: 'testTableHeaderWoID'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testTableHeadersWandWoScope: {
            attributes: {
                caseToRender: 'testTableHeadersWandWoScope'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testThNoWoScope: {
            attributes: {
                caseToRender: 'testThNoWoScope'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testScopeWithWrongVal: {
            attributes: {
                caseToRender: 'testScopeWithWrongVal'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testFieldSetsWStyle: {
            attributes: {
                caseToRender: 'fieldSetWithStyles'
            },
            test: function (cmp) {
                cmp.find("field_set_W_style_and_legend").getElement().style.display = "none";
                cmp.find("field_set_field_style_no_legend").getElement().style.display = "none";

                this.runTest(2, "Unexpected return from CheckAccessibility, should return 2 error. output: \n");
            }
        },
        testButtonLabelValid: {
            attributes: {
                caseToRender: 'buttonLabelValid'
            },
            test: function (cmp) {
                this.runTest(2, "Unexpected return from CheckAccessibility, should return 2 errors. output: \n");
            }
        },
        testImageTagTest: {
            attributes: {
                caseToRender: 'imageTagTest'
            },
            test: function (cmp) {
                this.runTest(8, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        testHeadersCorrectOrder: {
            attributes: {
                caseToRender: 'headersCorrectOrder'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testHeadersWrongOrder: {
            attributes: {
                caseToRender: 'headersWrongOrder'
            },
            test: function (cmp) {
                this.runTest(2, "Unexpected return from CheckAccessibility, should return 2 error. output: \n");
            }
        },

        testHeadersWrongOrderWrapAround: {
            attributes: {
                caseToRender: 'headersWrongOrderWrapAround'
            },
            test: function (cmp) {
                this.runTest(2, "Unexpected return from CheckAccessibility, should return 2 error. output: \n");
            }
        },

        testHeadersWrongOrderReverse: {
            attributes: {
                caseToRender: 'headersWrongOrderReverse'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testAnchorWithInnerText: {
            attributes: {
                caseToRender: 'anchorWInnerText'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testAnchorWithOutInnerText: {
            attributes: {
                caseToRender: 'anchorWOInnerText'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },

        testAnchorInOutputURLInfo: {
            attributes: {
                caseToRender: 'anchorInOutputURLInfo'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testAnchorInOutputURLDeco: {
            attributes: {
                caseToRender: 'anchorInOutputURLDeco'
            },
            test: function (cmp) {
                this.runTest(2, "Unexpected return from CheckAccessibility, should return 2 error. output: \n");
            }
        },

        testRadioIsInFieldSetError: {
            attributes: {
                caseToRender: 'RadioErrors'
            },
            test: function (cmp) {
                this.runTest(4, "Unexpected return from CheckAccessibility, should return 4 error. output: \n");
            }
        },

        testRadioIsInFieldSetNoError: {
            attributes: {
                caseToRender: 'NoRadioErrors'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testLabels: {
            attributes: {
                caseToRender: 'labelTest'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testLabelsNotNeeded: {
            attributes: {
                caseToRender: 'labelsNotNeeded'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },

        testAnchorMenuTest: {
            attributes: {
                caseToRender: 'anchorMenuTest'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testCKEditorTest: {
            attributes: {
                caseToRender: 'ckeditor_test'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },

        testUseSpecificDomElement: {
            attributes: {
                caseToRender: 'full'
            },
            test: [
                function (cmp) {
                    this.runTest(4, "Unexpected return from CheckAccessibility, should return 4 error. output: \n", document.getElementById("table1"));
                },
                function (cmp) {
                    this.runTest(2, "Unexpected return from CheckAccessibility, should return 2 error. output: \n", document.getElementById("field_set"));
                }
            ]

        },

        testNoElements: {
            attributes: {
                caseToRender: 'None'
            },
            test: function (cmp) {
                this.runTest(0, "Unexpected return from CheckAccessibility, should not return erroneous string. output: \n");
            }
        },
        testSkipVisualForceIframes: {
            attributes: {
                caseToRender: 'skipIframeForVisForce'
            },
            test: function (cmp) {
                this.runTest(1, "Unexpected return from CheckAccessibility, should return 1 error. output: \n");
            }
        },
        testTagsWithoutAttributes: {
            attributes: {
                caseToRender: 'tagsWithoutAttributes'
            },
            test: function (cmp) {
                this.runTest(5, "Unexpected return from CheckAccessibility, should return 5 errors. output: \n");
            }

        },

        //Full tests
        testCheckAccessibility: {
            test: function (cmp) {
                this.runTest(10, "Unexpected return from CheckAccessibility, should return 10 error. output: \n");
            }
        },

        // TODO(W-2443993): Convert this test to xUnit or remove completely
        _testAssertAccessible: {
            test: function (cmp) {
                var expected = 10;
                var actual = "";
                try {
                    $A.test.assertAccessible();
                } catch (err) {
                    actual = err.message.trim().split("\n\n").length;
                    $A.test.assertEquals(expected, actual, "Unexpected return from assertAccessilbe, expected: " + expected + " actual: " + actual);

                }
            }
        }
})