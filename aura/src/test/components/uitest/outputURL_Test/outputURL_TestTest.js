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
     * Verifies that there is only one location (history) change
     * when the component is rerendered multiple times. Previously,
     * multiple click event handlers for location change were applied
     * when component was rerendered.
     *
     * Only applies to anchors with href starting with "#"
     * This is really testing htmlHelper.js when it sets up FastClick handling
     */
    testOutputURLWithHashHandlers:{
        test:function(cmp){
            var urlCmp = cmp.find('hashLink'),
                urlEl = urlCmp.getElement();

            // replicate rerender
            $A.renderingService.rerender(urlCmp);
            $A.renderingService.rerender(urlCmp);
            $A.renderingService.rerender(urlCmp);
            $A.renderingService.rerender(urlCmp);
            $A.renderingService.rerender(urlCmp);

            // click three times
            $A.test.clickOrTouch(urlEl);
            $A.test.clickOrTouch(urlEl);
            $A.test.clickOrTouch(urlEl);

            // if multiple duplicate location change handlers were applied,
            // location change count would increase exponentially instead of + 1
            // locationChangeCount is greater by one because Aura sets
            // first history on init
            $A.test.addWaitFor(3, function() {
                return cmp.get("v.clickCount");
            },
            function() {
                var clickCount = cmp.get("v.clickCount"),
                    locationChangeCount = cmp.get("v.locationChangeCount"),
                    href = urlEl.getAttribute('href');
                $A.test.assertEquals(
                    clickCount + 1,
                    locationChangeCount,
                    "Location changed too many times. Duplicate click handlers were applied to anchor");
                $A.test.assertTrue(
                    href == "javascript:void(0);" || href == "javascript:void(0/*#" + locationChangeCount +"*/);",
                    "href attribute not correct"
                );
            });
        }
    }
})