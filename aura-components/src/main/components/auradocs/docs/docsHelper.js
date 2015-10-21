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
        $A.util.addClass(cmp.find('navbar').getElement(), "waiting");
    },

    hideWaiting : function(cmp){
        $A.util.removeClass(cmp.find('navbar').getElement(), "waiting");
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
                            $A.createComponent("auradocs:referenceTree", {}, function(referenceTree) {
                                sidebar.set("v.body", referenceTree);
                            });
                        }
                    }
                    

                }
            } else {

                // KRIS
                // Lets cause this to fail so we can give a better error message.
                throw new $A.auraError("Layout Failed for the docs app.");
            }
        });

        $A.enqueueAction(action);
    }
})

