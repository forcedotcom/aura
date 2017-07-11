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
    // To cover updates on first time the component is loaded
    doInit: function(cmp, event, helper){
      cmp.updateMenu();
    },

    // Updates the content of the menu.
    updateMenu: function(cmp, event, helper) {
      cmp.set('v.entries', []);
      var controller = this;
      setTimeout($A.getCallback(function(){ // The setTimeout is to simulate a long back-end round trip
        if (!controller._previousHighestItem) {
          controller._previousHighestItem = 1;
        }
        cmp.set('v.entries', [ controller._previousHighestItem, controller._previousHighestItem + 1, controller._previousHighestItem + 2, controller._previousHighestItem + 3 ]);
        controller._previousHighestItem += 4;
        cmp.getEvent('menuList_DynamicallyLoadedItemsUpdated').fire();
      }), 200);
    },

    // The handler on click of an item
    itemClicked: function(cmp, event) {
      $A.log(event.getSource().get("v.label") + ' was clicked.');
    }
})
