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
{
    setHost : function(component, event, helper) {
        $A.clientService.initHost(component.get("v.host"));
    },

    setConnectedFalse : function( component, event, helper) {
        $A.clientService.setConnected(false);
    },
    
    setConnectedTrue : function( component, event, helper) {
        $A.clientService.setConnected(true);
    },

    testConnection: function(component, event, helper) {
        component.getValue("v.actionStatus").setValue("");
        component.getValue("v.actionValue").setValue("");
        var a = component.get("c.getInt");
        a.setParams({ param : 66 });
        a.setCallback(this, function(action){
            component.getValue("v.actionStatus").setValue(action.getState());
            component.getValue("v.actionValue").setValue(action.getReturnValue());
        });
        $A.enqueueAction(a);
    },

    logEvent: function(component, event, helper) {
        var val = component.getValue("v.eventsFired");
        var oldVal = val.getValue();
        val.setValue(oldVal + (oldVal == "" ? "" : " ") + event.getDef().getDescriptor().getName());
    }
}
