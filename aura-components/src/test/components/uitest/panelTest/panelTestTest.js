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
 * WITHOUT WARRANTIES OR CONDITIOloNS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    /**
     * Test to verify action menu works when interacting with the menu items
     * using AURA API  
     * Disabling test from IE7 and IE8.
     */
    browsers: ["-IE7","-IE8"],
   /**
    * Test to verify first inputElement is focused
    */
   testPanelFocusOnFirstInput: {
    test: [function(cmp) {
            cmp.find("modalButton").get("e.press").fire();
        },
        function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function(){
                var activeElement = document.activeElement;
                return $A.util.hasClass(activeElement,"firstInput");
            }, "First input element should be focused.");
        }
    ]
  }
})
