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
({

    selectLayout2WithDefaultAction : function() {
        $A.layoutService.changeLocation('layout2', { overrideBehavior : false });
    },

    selectLayout2WithOverride : function() {
        $A.layoutService.changeLocation('layout2', { overrideBehavior : true });
    },

    selectLayout2WithSetWindowLocation : function(component) {
        window.location = '#layout2';
    },

    selectLayout1WithSetWindowLocation : function() {
        window.location = '#layout1';
    },

    selectDefaultLayoutWithSetWindowLocation : function(component, event){
        window.location = '';
    },

    handleTestLayoutHandlerEvent : function(component, event) {
        component.getAttributes().setValue("wasLayoutHandlerCalled", event.getParam("wasLayoutHandlerCalled"));
        component.getAttributes().setValue("wasBehaviorOverridden", event.getParam("wasBehaviorOverridden"));
    },

    selectLayout2WithParams : function() {
        $A.layoutService.changeLocation('layout2?param1=ObjectID&param2=mode ');
    },

    locationCange: function(component, event){
        var params = 'param1='+ event.getParam('param1');
        params += ' param2='+event.getParam('param2');
        component.getAttributes().setValue("hashparams", params);
    },

    handleLayoutFailedEvent : function(component) {
        var count = component.get("v.layoutFailedCount");
        component.getValue("v.layoutFailedCount").setValue(++count);
    }
})
