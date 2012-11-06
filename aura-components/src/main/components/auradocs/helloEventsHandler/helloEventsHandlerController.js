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
{
    handleComponentEventFired : function(cmp, event) {
        var attributes = cmp.getAttributes();

        var context = event.getParam("context");
        attributes.setValue("mostRecentEvent", "Most recent event handled: COMPONENT event, from " + context);

        var numComponentEventsHandled = parseInt(attributes.getValue("numComponentEventsHandled").getValue()) + 1;
        attributes.setValue("numComponentEventsHandled", numComponentEventsHandled);
    },

    handleApplicationEventFired : function(cmp, event) {
        var attributes = cmp.getAttributes();

        var context = event.getParam("context");
        attributes.setValue("mostRecentEvent", "Most recent event handled: APPLICATION event, from " + context);

        var numApplicationEventsHandled = parseInt(attributes.getValue("numApplicationEventsHandled").getValue()) + 1;
        attributes.setValue("numApplicationEventsHandled", numApplicationEventsHandled);
    }
}
