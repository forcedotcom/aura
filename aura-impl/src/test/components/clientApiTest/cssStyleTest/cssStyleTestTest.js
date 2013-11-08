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
 * Automation for adding CSS styles to the DOM. Everything that's preloaded should already be in app.css, so we only
 * should be adding style elements of non-preloaded components.
 */
({
    /**
     * Verify non-preloaded styles are appended to head, while preloaded CSS is not.
     */
    testStylesAppendedToHead : {
        test : function(cmp) {
            var head = document.getElementsByTagName('head')[0];
            var styleElements = head.getElementsByTagName('style');
            var cmpCssPresent = false;
            var nonPreloadedCssPresent = false;
            var uiNamespaceCssPresent = false;

            for (var i = 0; i < styleElements.length; i++) {
                var styleText = this.getStyleElementText(styleElements[i]);

                if (styleText.indexOf(".clientApiTestCssStyleTest") !== -1) {
                    if (!cmpCssPresent) {
                        cmpCssPresent = true;
                    } else {
                        $A.test.fail("Component CSS is being applied more than once.");
                    }
                }
                if (styleText.indexOf(".testTestValidCSS") !== -1) {
                    if (!nonPreloadedCssPresent) {
                        nonPreloadedCssPresent = true;
                    } else {
                        $A.test.fail("Non-preloaded CSS is being applied more than once.");
                    }
                }
                if (styleText.indexOf(".uiInputText") !== -1 || styleText.indexOf(".uiOutputText") !== -1) {
                    if (!uiNamespaceCssPresent) {
                        uiNamespaceCssPresent = true;
                    } else {
                        $A.test.fail("Preloaded CSS is being applied more than once.");
                    }
                }
            }

            $A.test.assertTrue(cmpCssPresent, "Component style element not appended to head.");
            $A.test.assertTrue(nonPreloadedCssPresent, "Style of non-preloaded cmp should be appended to head.");
            $A.test.assertFalse(uiNamespaceCssPresent, "Style of preloaded cmps should not be appended to head.");
        }
    },
    /**
     * Verify the correct class names are added to elements so that the proper CSS can be applied.
     */
    testCssClassNames : {
        test : function(cmp) {
            var inputTextClasses = cmp.find('inputText').getElement().auraClass;
            var outputTextClasses = cmp.find('outputText').getElement().auraClass;
            var pClasses = cmp.find('p').getElement().auraClass;

            $A.test.assertEquals("uiInput uiInputText clientApiTestCssStyleTest", $A.util.trim(inputTextClasses),
                    "Incorrect class names present on inputText.");
            $A.test.assertEquals("uiOutputText clientApiTestCssStyleTest", $A.util.trim(outputTextClasses),
                    "Incorrect class names present on outputText.");
            $A.test.assertEquals("clientApiTestCssStyleTest", $A.util.trim(pClasses),
                    "Incorrect class names present on <p> element.");
        }
    },
    getStyleElementText : function(element) {
        var browser = $A.getGlobalValueProviders().get("$Browser");
        if (browser.isIE7 || browser.isIE8 || browser.isIE9 || browser.isIE10) {
            return element.styleSheet.cssText;
        }
        return $A.util.getText(element);
    }
})
