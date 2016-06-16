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
    callGlobalMethodInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").globalMethod();
    },
    
    callPublicMethodInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").publicMethod();
    },
    
    callPrivateMethodInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").privateMethod();
    },
    
    callPrivilegedMethodInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").privilegedMethod();
    },
    
    callInternalMethodInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").internalMethod();
    },
    
    setGlobalAttributeInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").set("v.globalAttribute", "new global");
    },
    
    setPublicAttributeInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").set("v.publicAttribute", "new public");
    },
    
    setPrivateAttributeInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").set("v.privateAttribute", "new private");
    },
    
    setPrivilegedAttributeInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").set("v.privilegedAttribute", "new privileged");
    },
    
    setInternalAttributeInComponentWithGlobalAccess: function(component, event, helper){
    	component.find("accessGlobalComponent").set("v.internalAttribute", "new internal");
    },
})