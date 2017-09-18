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
    fireEvent : function(cmp, event) {
        // Get the component event by using the
        // name value from <aura:registerEvent> tag
        var compEvent = cmp.getEvent("compEvent");
        compEvent.fire();
    },
    
    addEventHandler : function(cmp, event) {
        // First param matches name attribute in <aura:registerEvent> tag
        cmp.addEventHandler("compEvent", cmp.getReference("c.handleEvent"));
    },

    handleEvent : function(cmp, event) {
        alert("Handled the component event");
    },

    fireAppEvent : function(cmp, event) {
        var appEvent = $A.get("e.handleEventTest:applicationEvent");
        appEvent.fire();
    },
    
    addAppEventHandler : function(cmp, event) {
        cmp.addEventHandler("handleEventTest:applicationEvent", cmp.getReference("c.handleAppEvent"));
    },

    handleAppEvent : function(cmp, event) {
        alert("Handled the application event");
    },

    handleAndLogEventType: function(cmp, event) {
        cmp.set("v.output", event.getType());
    }
})