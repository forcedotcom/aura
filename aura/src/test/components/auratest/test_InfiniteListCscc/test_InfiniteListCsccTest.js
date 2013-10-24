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
     * Verify initial iteration returned from server
     */
    testServerResults: {
        attributes : {disabled: false},
        test: function(component){
        	
        	var btns = component.find("aButton");
 
        	$A.log($A.util.getText(btns[0].getElement()));

        	// confirm three appropriately labeled server-created buttons
            $A.test.assertStartsWith("isClose-false Server 0", $A.util.getText(btns[0].getElement()));
            $A.test.assertStartsWith("isClose-false Server 1", $A.util.getText(btns[1].getElement()));
            $A.test.assertStartsWith("isClose-false Server 2", $A.util.getText(btns[2].getElement()));
        }
    },
    /**
     * Verify that a client item can be added with expected expression behavior
     */
    testClientAdd: {
        test: function(component){

        	// add one item to iteration from client using button
        	$A.run(function(){
        		component.get("addItem").get("e.press").fire();
        	});

        	var btns = component.find("aButton");

        	// confirm client added button
            $A.test.assertStartsWith("isClose-false Client", $A.util.getText(btns[0].getElement()));
        	// confirm three appropriately labeled server-created buttons
            $A.test.assertStartsWith("isClose-false Server 0", $A.util.getText(btns[1].getElement()));
            $A.test.assertStartsWith("isClose-false Server 1", $A.util.getText(btns[2].getElement()));
            $A.test.assertStartsWith("isClose-false Server 2", $A.util.getText(btns[3].getElement()));
            
        }
    },
    /**
     * Verify that server created iteration components will actively respond to 
     * underlying value changes on which expressions depend 
     */
    testServerItemActive: {
        test: function(component){


        	var btns = component.find("aButton");

        	$A.test.assertStartsWith("isClose-false Server 0", $A.util.getText(btns[0].getElement()));

        	// get collection of buttons
        	var btns = component.find("aButton");

        	// press the first button,  changing what the expression is dependent on
        	btns[0].get("myButton").get("e.press").fire();
        	
        	var temp = $A.util.getText(btns[0].getElement());
        	$A.test.assertStartsWith("isClosed-true Server 0", temp);
        }
    },
    /**
     * Verify that a combination of client and server iteration components will actively respond to 
     * underlying value changes on which expressions depend 
     */
    testClientItemActive: {
        test: function(component){
        	// add one item to iteration from client using button
        	$A.run(function(){
        		component.get("addItem").get("e.press").fire();
        	});

        	// get collection of buttons
        	var btns = component.find("aButton");

        	// press the first button,  changing what the expression is dependent on
        	btns[0].get("myButton").get("e.press").fire();
        	btns[1].get("myButton").get("e.press").fire();
        	
        	var temp = $A.util.getText(btns[0].getElement());
        	$A.test.assertStartsWith("isClosed-true Client", temp);

        	temp = $A.util.getText(btns[1].getElement());
        	$A.test.assertStartsWith("isClosed-true Server 0", temp);

        }
    }
})