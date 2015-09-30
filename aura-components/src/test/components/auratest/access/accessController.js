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
    /**
     * Get attribute from self and create a text component with it.
     */
    testAttributeAccess: function(component, event, helper){
        var attributeName="v."+component.get("v.testType");
        $A.createComponent("aura:text",{"value":component.get(attributeName)},function(label){
            component.find("local").set("v.body",label);
        });
    },

    /**
     * Get attribute from a component in a different namespace and create a text component with it.
     */
    testRemoteAttributeAccess: function(component, event, helper){
        var attributeName="v."+component.get("v.testType");
        $A.createComponent("aura:text",{"value":component.find("remote").get(attributeName)},function(label){
            component.find("local").set("v.body",label);
        });
    },

    testComponentAccess: function(component, event, helper){
        var callback = function(newCmp) {
            component.set("v.output", newCmp);
            component.set("v.testDone", true);
        };
        $A.createComponent(component.get("v.testType"), {}, callback);
    },

    testEventAccess: function(component, event, helper){
        var eventName = "e." + component.get("v.testType");
        var event = component.get(eventName);
        component.set("v.output", event);
    },
    
    testRemoteEventAccess: function(component, event, helper){
        var eventName = "e." + component.get("v.testType");
        var event = component.find("remote").get(eventName);
        component.set("v.output", event);
    }
})
