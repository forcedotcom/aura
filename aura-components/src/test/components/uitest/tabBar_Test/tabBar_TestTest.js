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
    /* Test that addTab calls a callback function */
    testAddTab: {
        test: [
            function(cmp) {
                var callbackCalled = false;
                var config = {};
                var values = {};

                values["title"] = "title";
                values["name"] = "name";
                values["active"] = true;
                values["hidden"] = false;
                values["closable"] = true;
                config["attributes"] = values;
                config["descriptor"] = "markup://ui:tabItem";

                var tabBar = cmp.find("tabBar");
                tabBar.get("e.addTab").setParams({
                    tab: config,
                    index: 0,
                    callback: function(newTabItem) {
                        var def = newTabItem.getDef().getDescriptor().getQualifiedName();
                        $A.test.assertEquals("markup://ui:tabItem", def, "The object type of the callback parameter is not correct.");
                        callbackCalled = true;
                    }
                }).fire();

                $A.test.addWaitForWithFailureMessage(true,
                    function(){
                        return callbackCalled;
                    },
                    "Callback was not called."
                );
            }
        ] 
    }
})