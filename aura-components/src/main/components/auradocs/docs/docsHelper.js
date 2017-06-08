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
    showWaiting : function(cmp){
        var count = cmp.get("v.waitingCount") + 1;
        cmp.set("v.waitingCount", count);
        if (count === 1) { //waiting is racy so only act the first time
            $A.util.addClass(cmp.find('navbar').getElement(), "waiting");
        }
    },

    hideWaiting : function(cmp){
        var count = cmp.get("v.waitingCount") - 1;
        cmp.set("v.waitingCount", count);
        if (cmp.get("v.waitingCount") === 0) { //waiting is racy so only act when everyone is done
            $A.util.removeClass(cmp.find('navbar').getElement(), "waiting");
        }
    },
    showRefreshing : function(cmp){
        $A.util.addClass(cmp.find('navbar').getElement(), "refreshing");
    },

    hideRefreshing : function(cmp){
        $A.util.removeClass(cmp.find('navbar').getElement(), "refreshing");
    },

    setLayout: function(cmp, layout, parameters) {
        var action = layout == "reference" ? cmp.get("c.getReference") : cmp.get("c.getTopic");
        action.setStorable();
        action.setParams(parameters);

        action.setCallback(this, function(action) {
            var state = action.getState();
            if (state === "SUCCESS") {
                var ret = action.getReturnValue();
                if(ret) {
                    var content = cmp.find("content");
                    var newComponents = $A.createComponentFromConfig(ret);

                    content.set("v.body", newComponents);

                    if(layout === "reference") {
                        var sidebar = cmp.find("sidebar");
                        if(sidebar.get("v.body").length === 0) {
                            $A.createComponent("markup://auradocs:referenceTree", {}, function(referenceTree, status, messages) {
                            	if (status === "SUCCESS") {
                            		sidebar.set("v.body", referenceTree);
                            	}
                            });
                        }
                    }
                    

                }
            } else if(state === "INCOMPLETE" || state === "ERROR") {

                // KRIS
                // Lets cause this to fail so we can give a better error message.
                throw new Error("Layout Failed for the docs app.");
            }
        });

        $A.enqueueAction(action);
    }
})

