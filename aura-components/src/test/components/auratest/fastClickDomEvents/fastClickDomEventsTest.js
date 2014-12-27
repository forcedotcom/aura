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
     * Verify fast click behavior. Events propogate up to all components.
     */
    testFastClickEventsPropogation: {
        test: function(cmp) {
        	$A.test.assertEquals("", cmp.get("v.outterEvent"), "initial value of outterEvent value incorrect");
        	$A.test.assertEquals("", cmp.get("v.middleEvent"), "initial value of middleEvent value incorrect");
        	$A.test.assertEquals("", cmp.get("v.innerEvent"), "initial value of innerEvent value incorrect");
        	
        	var radio = cmp.find("maleRadio").getElement();
        	$A.test.clickOrTouch(radio);
        	
        	$A.test.addWaitForWithFailureMessage(true, function() {
                return (cmp.get("v.outterEvent").indexOf("DOM event") >= 0) &&
                	(cmp.get("v.middleEvent").indexOf("DOM event") >= 0) &&
                	(cmp.get("v.innerEvent").indexOf("DOM event") >= 0);
            }, "Event did not propogate to ALL components.");
        }
    }
})
