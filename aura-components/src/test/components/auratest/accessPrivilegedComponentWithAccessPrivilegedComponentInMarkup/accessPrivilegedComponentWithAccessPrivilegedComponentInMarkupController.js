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
    callGlobalMethodInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").globalMethod();
    },
    
    callPublicMethodInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").publicMethod();
    },
    
    callPrivateMethodInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").privateMethod();
    },
    
    callPrivilegedMethodInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").privilegedMethod();
    },
    
    callInternalMethodInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").internalMethod();
    },
    
    setGlobalAttributeInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").set("v.globalAttribute", "new global");
    },
    
    setPublicAttributeInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").set("v.publicAttribute", "new public");
    },
    
    setPrivateAttributeInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").set("v.privateAttribute", "new private");
    },
    
    setPrivilegedAttributeInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").set("v.privilegedAttribute", "new privileged");
    },
    
    setInternalAttributeInComponentWithPrivilegedAccess: function(component, event, helper){
    	component.find("accessPrivilegedComponent").set("v.internalAttribute", "new internal");
    },
})