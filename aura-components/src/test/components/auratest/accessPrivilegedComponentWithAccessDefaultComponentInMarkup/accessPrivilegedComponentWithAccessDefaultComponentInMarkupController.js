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
    callGlobalMethodInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").globalMethod();
    },
    
    callPublicMethodInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").publicMethod();
    },
    
    callPrivateMethodInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").privateMethod();
    },
    
    callPrivilegedMethodInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").privilegedMethod();
    },
    
    callInternalMethodInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").internalMethod();
    },
    
    setGlobalAttributeInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").set("v.globalAttribute", "new global");
    },
    
    setPublicAttributeInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").set("v.publicAttribute", "new public");
    },
    
    setPrivateAttributeInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").set("v.privateAttribute", "new private");
    },
    
    setPrivilegedAttributeInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").set("v.privilegedAttribute", "new privileged");
    },
    
    setInternalAttributeInComponentWithDefaultAccess: function(component, event, helper){
    	component.find("accessDefaultComponent").set("v.internalAttribute", "new internal");
    },
})