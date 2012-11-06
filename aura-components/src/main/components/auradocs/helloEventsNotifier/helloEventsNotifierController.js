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
    fireComponentEvent : function(cmp, event) {
        var attributes = cmp.getAttributes();
        var parentName = attributes.getValue("parentName").getValue();

        // Look up event by name, not by type
        var helloEventsComponentEvent = cmp.getEvent("componentEventFired");
        helloEventsComponentEvent.setParams({ "context" : parentName });
        helloEventsComponentEvent.fire();
    },

    fireApplicationEvent : function(cmp, event) {
        var attributes = cmp.getAttributes();
        var parentName = attributes.getValue("parentName").getValue();

        var helloEventsApplicationEvent = $A.get("e.auradocs:helloEventsApplicationEvent");

        helloEventsApplicationEvent.setParams({ "context" : parentName });
        helloEventsApplicationEvent.fire();
    }
}
