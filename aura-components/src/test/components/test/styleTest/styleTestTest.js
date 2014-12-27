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
    /**
     * Verify css from template is properly injected and present on loaded DOM.
     */
    testStyleCssInjectedIntoDom : {
        browsers : ["-IE7", "-IE8"],
        test : function(cmp) {
            var found = false;
            var cssText = "";
            var styleSheets = document.styleSheets;
            for (var i = 0; i < styleSheets.length; i++) {
                var cssRules = styleSheets[i].cssRules;
                for (var j = 0; j < cssRules.length; j++) {
                    /*
                     * IE10 has a nasty habit of throwing "unknown" (when using typeof) or Member not found. exceptions with
                     * CSS styles that it doesn't understand
                     */
                    if ($A.get("$Browser").isIE10 && typeof cssRules[j].cssText === 'unknown') {
                       continue;
                    }
                    cssText = cssRules[j].cssText;

                    cssText = cssText.replace(/\s+/g, '').toLowerCase();
                    // Different browsers have slightly different formatting so just check enough to feel confident
                    if (cssText.indexOf(".templaterule{border") != -1 && cssText.indexOf("font-style:italic") != -1) {
                        found = true;
                        continue;
                    }
                }
            }
            $A.test.assertTrue(found, "Loaded app does not have template css present.");
        }
   },

    /**
     * Same test as above (testStyleCssInjectedIntoDom), but older versions of IE have different properties on the
     * styleSheets object so try to find the template CSS a slightly different way.
     */
    testStyleCssInjectedIntoDomIE : {
        browsers : ["IE7", "IE8"],
        test : function(cmp) {
            var found = false;
            var styleSheets = document.styleSheets;
            for (var i = 0; i < styleSheets.length; i++) {
                var cssText = styleSheets[i].cssText;
                cssText = cssText.replace(/\s+/g, '').toLowerCase();
                if (cssText.indexOf(".templaterule{border") != -1 && cssText.indexOf("font-style:italic") != -1) {
                    found = true;
                    continue;
                }
            }
            $A.test.assertTrue(found, "Loaded app does not have template css present.");
        }
   }
})