/*
 * Copyright (C) 2012 salesforce.com, inc.
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
{
    /*
     * passing an actionref as an attribute to another cmp
     */
    testActionPassing: {
        test: [function(component){
            // the text node for pants
            var text = component.find("actionref").getElements()[1];
            var getButton = component.find("getButton").getElement();
            var evt = document.createEvent("Events");
            evt.initEvent("click", true, true);

            $A.test.assertEquals("0", text.nodeValue, "initial value for pants wasn't 0");

            var mar = component.get("v.myActionRef");
            $A.test.assertEquals(undefined, mar, "there should no actionref yet");

            getButton.dispatchEvent(evt);
            mar = component.get("v.myActionRef");

            $A.test.assertTrue(mar && mar.auraType === "Value", "there should be an actionref");

        }, function(component) {
            var text = component.find("actionref").getElements()[1];
            var runButton = component.find("runButton").getElement();
            var evt = document.createEvent("Events");
            evt.initEvent("click",true,true);

            runButton.dispatchEvent(evt);
            $A.test.assertEquals("1", text.nodeValue, "action was not called");
            runButton.dispatchEvent(evt);
            $A.test.assertEquals("2", text.nodeValue, "action should have been called twice");
            runButton.dispatchEvent(evt);
            $A.test.assertEquals("3", text.nodeValue, "action should have been called thrice");
        }]
    }
}
