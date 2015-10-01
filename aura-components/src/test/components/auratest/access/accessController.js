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
    },

    testSetNonExistentAttribute: function(component, event, helper) {
        component.set("v.iDontExist", "value");
        var value = component.get("v.iDontExist");
        component.set("v.output", value);
    },

    testSetNonExistentRemoteAttribute: function(component, event, helper) {
        component.find("remote").set("v.iDontExist", "value");
        var value = component.find("remote").get("v.iDontExist");
        component.set("v.output", value);
    },

    globalMethod: function(component, event, helper) {
        component.set("v.output", "globalMethod");
    },

    publicMethod: function(component, event, helper) {
        component.set("v.output", "publicMethod");
    },

    internalMethod: function(component, event, helper) {
        component.set("v.output", "internalMethod");
    },

    privateMethod: function(component, event, helper) {
        component.set("v.output", "privateMethod");
    },

    testMethods: function(component, event, helper) {
        var access = event.getParam('arguments').accessLevel;
        switch(access) {
        case "GLOBAL":
            component.globalMethod();
            break;
        case "PUBLIC":
            component.publicMethod();
            break;
        case "INTERNAL":
            component.internalMethod();
            break;
        case "PRIVATE":
            component.privateMethod();
            break;
        }
    },
    
    testRemoteMethodAccess: function(component, event, helper) {
        var access = component.get("v.testType");
        var remote = component.find("remote");
        switch(access) {
        case "GLOBAL":
            remote.globalMethod();
            break;
        case "PUBLIC":
            remote.publicMethod();
            break;
        case "INTERNAL":
            remote.internalMethod();
            break;
        case "PRIVATE":
            remote.privateMethod();
            break;
        }
        
    }
})
