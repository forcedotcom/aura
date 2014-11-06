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
    /*
     * passing an actionref as an attribute to another cmp
     */
    testActionPassing: {
        test: [function(component){
            // the text node for pants
            var text = component.find("actionref").getElements()[1];
            $A.test.assertEquals("0", text.nodeValue, "initial value for pants wasn't 0");
            var mar = component.get("v.myActionRef");
            $A.test.assertEquals(null, mar, "there should be no action yet");

        }, function(component){
        	var getButton = component.find("getButton");
            getButton.get("e.press").fire();
            mar = component.get("v.myActionRef");
            $A.test.assertEquals("Action", mar.auraType, "there should be an actionref");
        }, function(component) {     
            component.find("runButton").get("e.press").fire();
        }, function(component) {           
        	//Check that the previous Action (firing the button, changed the correct elements)
        	var text = component.find("actionref").getElements()[1];       	
        	$A.test.assertEquals("1", text.nodeValue, "action was not called");
        	
        	component.find("runButton").get("e.press").fire();
        }, function(component) {  
        	//Check that the previous Action (firing the button, changed the correct elements)
        	var text = component.find("actionref").getElements()[1];
            $A.test.assertEquals("2", text.nodeValue, "action should have been called twice");
            
            component.find("runButton").get("e.press").fire();
        }, function(component) {
        	//Check that the previous Action (firing the button, changed the correct elements)
        	var text = component.find("actionref").getElements()[1];
            $A.test.assertEquals("3", text.nodeValue, "action should have been called thrice");
        }]
    }
})
