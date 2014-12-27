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

// Excluding ie8 and 7 browsers due to lack of support for addEventListener function
({
    
    
   /*
    * Testing to make sure that when pullToRefresh and PullToShowMore are not present,
    * that there isn't a spacer div. This appears when the amount of data on the screen
    * does not fill out the scrollable area 
    */ 
   testNoPullToRefreshNoDivSpace: {
       browsers: ["-IE7","-IE8"],
        test: function(cmp) {
            var wrapper     = cmp.find("scroller3").getElement(),
                content     = wrapper.children[0],
                divChildren = content.children.length;

            $A.test.assertFalse(divChildren > 1, "User does not want to pull to refresh, there should not be a div for a spacer here");
        }
    }
})