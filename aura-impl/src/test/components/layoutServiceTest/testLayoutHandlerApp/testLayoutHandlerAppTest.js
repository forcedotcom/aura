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
({
    /**
     * Test $A.layoutService.changeLocationWithOverrideParams.
     */
    testChangeLocationWithOverride: {
        attributes: { __layout: "#layout1?param1=go&param2=stop" },
        test: [function(component) {
                $A.test.addWaitFor("Welcome to layout1", function(){return component.find("content").get("v.body")[0] && $A.test.getText(component.find("content").get("v.body")[0].getElement());});
            }, function(component) {
                component.find("buttonWithDirectCallWithOverride").get("e.press").fire();
                $A.test.addWaitFor(true, function(){return component.get("v.wasLayoutHandlerCalled");});
                $A.test.addWaitFor(true, function(){return component.get("v.wasBehaviorOverridden"); /*The app does not think the layout behavior was overridden*/});
            }
        ]
    },

    testChangeLocationBysettingWindowLocation: {
        attributes: { __layout: "#layout1?param1=go&param2=stop" },
        test: [function(component) {
                $A.test.addWaitFor("Welcome to layout1", function(){return component.find("content").get("v.body")[0] && $A.test.getText(component.find("content").get("v.body")[0].getElement());});
            }, function(component) {
                component.find("buttonWithSetWindowLocationLayout2").get("e.press").fire();
                $A.test.addWaitFor("Welcome to layout2", function(){return $A.test.getText(component.find("content").getElement())}) /*New layout never loaded*/
                $A.test.addWaitFor(true, function(){return component.get("v.wasLayoutHandlerCalled");}); /*The layout handler was apparently not invoked when setting window.location*/
                $A.test.addWaitFor(false, function(){return component.get("v.wasBehaviorOverridden");});
            }
        ]
    },

    /**
     * Verify that LayoutFailed event is thrown only once, even if multiple failing LayoutItem's'.
     */
    testLayoutFailedEventCount: {
        attributes: { __layout: "#layout3" },
        test: [function(component) {
                $A.test.addWaitFor("Welcome to layout3", function(){return component.find("content").get("v.body")[0] && $A.test.getText(component.find("content").get("v.body")[0].getElement());});
            }, function(component) {
                $A.test.assertEquals(1, component.get("v.layoutFailedCount"), "LayoutFailed event should be fired once.");
            }
        ]
    }
})
