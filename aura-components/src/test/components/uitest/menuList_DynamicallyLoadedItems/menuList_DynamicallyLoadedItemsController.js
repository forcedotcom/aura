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
 * WITHOUT WARRANTIES OR CONDITIOloNS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 ({
    // So that the dynamic component gets created the first time, and updated the other times (so we make sure it works with subsequent updates too).
    onMenuExpand: function(cmp, event, helper) {
        if (!cmp.get('v.childCmpLoaded')) {
          setTimeout($A.getCallback(function(){  // The setTimeout is to simulate a long back-end round trip
            $A.createComponent(
                    "uitest:menuList_DynamicallyLoadedItems_child",
                    {
                        "aura:id": "childCmp"
                    },
                    function(newCmp, status, errorMessage){
                        if (status === "SUCCESS") {
                            cmp.set("v.childCmp", [newCmp]);
                            cmp.set("v.childCmpLoaded", true);
                        } else if (status === "INCOMPLETE") {
                            $A.log("No response from server or client is offline.");
                        } else if (status === "ERROR") {
                            $A.log("Error: " + errorMessage);
                        }
                    }
            );
          }), 200);
        } else {
          // To cover the use case where the child's body is updated even after the first
          // time the child component is loaded.
          cmp.find('childCmp').updateMenu();
        }
    },

    // The ui:menuList can't see changes in the dynamic component, therefore needs to be notified when there are some; this is the handler of the event for it.
    menuList_DynamicallyLoadedItemsUpdated: function(cmp) {
      $A.log('Notification of content change received; updating menuList.');
      cmp.find('actionMenu').update();
    }
})
