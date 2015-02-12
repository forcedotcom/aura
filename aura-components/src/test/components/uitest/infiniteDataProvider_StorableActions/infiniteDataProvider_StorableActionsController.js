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
    provide: function(component, event, helper) {
        if (!component._loadedOnce) {
            // Load list with some initial data
            component._loadedOnce = true;
            
            var data = [];
            for (var i = 0; i < 3; i++) {
                item = {'data': i + 'initial'};
                data.push(item);
            }
            helper.fireDataChangeEvent(component, data, 1);
        } else {
            component = component.getConcreteComponent();
            var cachedData = [],
                serverData = [],
                cachedDataRows = component.get("v.cachedDataRows"),
                serverDataRows = component.get("v.serverDataRows"),
                // Default to list's current page if target page isn't specified.
                cachedTargetPage = component.get("v.cachedTargetPage") || component.get("v.currentPage"),
                serverTargetPage = component.get("v.serverTargetPage") || component.get("v.currentPage"),
                item;

            // Build data in a format our item template understands
            for (var i = 0; i < cachedDataRows; i++) {
                item = {'data': i + 'cached'};
                cachedData.push(item);
            }
            for (i = 0; i < serverDataRows; i++) {
                item = {'data': i + 'server'};
                serverData.push(item) ;
            }

            // Only fire event to update list if we have data. This gives tests the ability to emulate getting only
            // cached or only server data
            if (cachedData.length > 0) {
                helper.fireDataChangeEvent(component, cachedData, cachedTargetPage);
            }
            if (serverData.length > 0) {
                helper.fireDataChangeEvent(component, serverData, serverTargetPage);
            }
        }
    }

})
