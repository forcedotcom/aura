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
     * Verify that server created iteration components will actively respond to 
     * underlying value changes on which expressions depend.
     */
    testServerItemActive: {
        test: function(component){
            // get collection of buttons
            var btns = component.find("aButton");

            // Verify initial state of components
            $A.test.assertStartsWith("isClose-false Server 0", $A.util.getText(btns[0].getElement()));
            $A.test.assertStartsWith("isClose-false Server 1", $A.util.getText(btns[1].getElement()));
            $A.test.assertStartsWith("isClose-false Server 2", $A.util.getText(btns[2].getElement()));

            // press the first button,  changing what the expression is dependent on
            btns[0].get("myButton").get("e.press").fire();

            $A.test.assertStartsWith("isClosed-true Server 0", $A.util.getText(btns[0].getElement()));
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

            // verify initial component state
            $A.test.assertStartsWith("isClose-false Client", $A.util.getText(btns[0].getElement()));
            $A.test.assertStartsWith("isClose-false Server 0", $A.util.getText(btns[1].getElement()));

            // press the first button,  changing what the expression is dependent on
            btns[0].get("myButton").get("e.press").fire();
            btns[1].get("myButton").get("e.press").fire();

            // verify underlying data change is picked up
            $A.test.assertStartsWith("isClosed-true Client", $A.util.getText(btns[0].getElement()));
            $A.test.assertStartsWith("isClosed-true Server 0", $A.util.getText(btns[1].getElement()));
        }
    }
})