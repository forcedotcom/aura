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
    locationChange: function(cmp, event, helper) {
        // See if sidebar needs populating
        // Should only need being done once.
        var sidebar = cmp.find("sidebar");
        var sidebarBody = sidebar.get("v.body");
        if(sidebarBody.length === 0) {
            $A.createComponent("auradocs:referenceTree", {}, function(referenceTreeCmp){
                sidebar.set("v.body", referenceTreeCmp);
            });
        }

        var getReference = cmp.get("c.getReference");
        getReference.setStorable();
        getReference.setParams(event.getParams());

        getReference.setCallback(this, function(action) {
            var state = action.getState();
            if (state === "SUCCESS") {
                var ret = action.getReturnValue();
                if(ret) {
                    var content = cmp.find("content");
                    var newComponents = $A.componentService["newComponentDeprecated"](ret, null, false, true);

                    content.set("v.body", newComponents);
                }
            }
        });

        $A.enqueueAction(getReference);
    },
    
    waiting : function(cmp, event, helper){
        helper.showWaiting(cmp);
    },

    doneWaiting : function(cmp, event, helper){
        helper.hideWaiting(cmp);
    },

    refreshBegin : function(cmp, event, helper){
        helper.showRefreshing(cmp);
    },

    refreshEnd : function(cmp, event, helper){
        helper.hideRefreshing(cmp);
    }
})
