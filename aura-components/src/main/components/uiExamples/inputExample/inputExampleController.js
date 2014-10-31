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
    doInit : function(component, event, helper) {
        var today = new Date();
        component.set('v.today', today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate());
        component.set('v.deadline', today);
    },
    
    newEntry : function(component, event, helper) {
        component.set("v.display", true);
        var name = component.find("name").get("v.value");
        var code = component.find("num").get("v.value");
        var amount = component.find("amount").get("v.value");
        var email = component.find("email").get("v.value");
        
        var phone = component.find("phone").get("v.value");
        var expdate = component.find("expdate").get("v.value");
        var deadline = component.find("deadline").get("v.value");
        var reimbursed = component.find("reimbursed").get("v.value");
        var comments = component.find("comments").get("v.value");
        var url = component.find("url").get("v.value");
    
        var oName = component.find("oName");
        oName.set("v.value", name); 
        var oNumber = component.find("oNumber");
        oNumber.set("v.value", code);
        var oCurrency = component.find("oCurrency");
        oCurrency.set("v.value", amount);
        var oEmail = component.find("oEmail");
        oEmail.set("v.value", email);
        var oPhone = component.find("oPhone");
        oPhone.set("v.value", phone);
        
        var oDate = component.find("oDate");
        oDate.set("v.value", expdate);
        var oDateTime = component.find("oDateTime");
        oDateTime.set("v.value", deadline);
        var oCheckbox = component.find("oCheckbox");
        oCheckbox.set("v.value", reimbursed);
        var oTextarea = component.find("oTextarea");
        oTextarea.set("v.value", comments);
        var oURL = component.find("oURL");
        oURL.set("v.value", url);
        oURL.set("v.label", url);
        console.log(url);
        
    }
})