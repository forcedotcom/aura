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
     * Automation for W-1589512. Older browsers (specifically IE7 and 8) were not picking up multiple event listeners
     * on HTML elements.
     */
    testMultipleEventHandlersOnHtmlElement: {
        test: function(cmp) {
            var input = cmp.find("input").getElement();

            $A.test.fireDomEvent(input, "focus");
            $A.test.addWaitForWithFailureMessage(true, function() {
                return cmp.getAttributes().getValue("focusEvent").getBooleanValue();
            }, "Did not pick up focus event on html element");

            $A.test.fireDomEvent(input, "blur");
            $A.test.addWaitForWithFailureMessage(true, function() {
                return cmp.getAttributes().getValue("blurEvent").getBooleanValue();
            }, "Did not pick up blur event on html element");
        }
    }
})
