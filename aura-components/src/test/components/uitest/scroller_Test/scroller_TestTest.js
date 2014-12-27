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
    testToggleCanShowMore: {
        browsers: ["-IE7","-IE8"],
        test: [
            function(component) {
                // Make sure the "pull to show more" div exists
                var scrollerCmp = component.find("scrollToYTest"),
                    scroller    = scrollerCmp.getElement(),
                    pullUpDiv   = scroller.getElementsByClassName('pullToLoadMore')[0];

                $A.test.assertNotNull(pullUpDiv, "There should be a 'pullUp' div");

                // Toggle canShowMore dynamiclly
                scrollerCmp.set("v.canShowMore", false);

            },
            function(component) {
                // Now the "pull to show more" div should not exists
                var scrollerCmp = component.find("scrollToYTest"),
                    scroller    = scrollerCmp.getElement(),
                    pullUpDiv   = scroller.getElementsByClassName('pullToLoadMore')[0],
                    displayNone = pullUpDiv.style.display === 'none';

                $A.test.assertTrue(displayNone, "There should NOT be a 'pullUp' div");

                // Toggle canShowMore again
                scrollerCmp.set("v.canShowMore", true);

            },
            function(component) {
                // "pull to show more" div should be present again
                var scrollerCmp = component.find("scrollToYTest"),
                    scroller    = component.find("scrollToYTest").getElement(),
                    pullUpDiv   = scroller.getElementsByClassName('pullToLoadMore')[0],
                    displayNone = pullUpDiv.style.display === 'none';

                $A.test.assertFalse(displayNone, "There should be a 'pullUp' div");
            }
        ]
    }
})