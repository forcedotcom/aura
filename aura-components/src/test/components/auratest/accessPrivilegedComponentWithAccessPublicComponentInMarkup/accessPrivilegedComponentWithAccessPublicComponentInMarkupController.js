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
    callGlobalMethodInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").globalMethod();
    },
    
    callPublicMethodInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").publicMethod();
    },
    
    callPrivateMethodInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").privateMethod();
    },
    
    callPrivilegedMethodInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").privilegedMethod();
    },
    
    callInternalMethodInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").internalMethod();
    },
    
    setGlobalAttributeInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").set("v.globalAttribute", "new global");
    },
    
    setPublicAttributeInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").set("v.publicAttribute", "new public");
    },
    
    setPrivateAttributeInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").set("v.privateAttribute", "new private");
    },
    
    setPrivilegedAttributeInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").set("v.privilegedAttribute", "new privileged");
    },
    
    setInternalAttributeInComponentWithPublicAccess: function(component, event, helper){
    	component.find("accessPublicComponent").set("v.internalAttribute", "new internal");
    },
})