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
    testXSSRawHtml: {
        attributes: { "label": "testing", "descriptor": "auradocs:empty", "description": "" },
        test: [
            /**
             * Test that img tags lose event handlers
             */
            // Set
            function(cmp) {
                cmp.set("v.description", "<img src='doesnotexist.png' onerror='window.testXSSRawHtml=1'/>");
            },
            // Verify
            function(cmp) {
                var img = cmp.getElement().querySelector("img");

                $A.test.assertFalse(img.hasAttribute("onerror"), "onerror attribute was present on the inserted img element");
            },

            /**
             * Test inline event handlers are not even part of the element when inserted.
             */
            // Set
            function(cmp){
                cmp.set("v.description", "<iframe src='about:blank' onload='window.testXSSRawHtml=2'/>");
            },
            // Verify
            function(cmp) {
                var iframe = cmp.getElement().querySelector("iframe");

                $A.test.assertFalse(iframe.hasAttribute("onload"), "onload attribute was present on the inserted iframe element");
            }

        ]
    }


 })