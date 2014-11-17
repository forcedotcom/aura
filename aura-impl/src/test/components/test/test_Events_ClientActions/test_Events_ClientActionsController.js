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
    changeLabel: function(cmp, event) {
            var componentForEventController = event.getSource();

            //Based on which event has been fired, the label for the inner component is changed
            if (event.getName().toString().indexOf("testPress")>-1) {
                componentForEventController.set("v.label", "Changed Label on Press# Location:test_Events_ClientActionsController# Event:testPress");
            } else if (event.getName().toString().indexOf("testMouseOver")>-1) {
                componentForEventController.set("v.label", "Changed Label# Location:test_Events_ClientActionsController# Event:Mouse Over");
            } else {
                componentForEventController.set("v.label", "Something went wrong");
            }
    }
})
