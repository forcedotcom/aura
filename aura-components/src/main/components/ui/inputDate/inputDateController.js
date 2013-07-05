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
    doInit: function(component, event, helper) {
        // Set placeholder
        var concreteCmp = component.getConcreteComponent();
        var format = concreteCmp.get("v.format");
        if (!format) {
            format = $A.getGlobalValueProviders().get("$Locale.dateformat");
        }
        concreteCmp.setValue("v.placeholder", format);
    },
    
    openDatePicker: function(component, event, helper) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayDatePicker(concreteCmp);
    },
    
    setValue: function(component, event, helper) {
        var dateValue = event.getParam("value");
        if (dateValue) {
            var concreteCmp = component.getConcreteComponent();
            concreteCmp.setValue("v.value", dateValue);
        }
    }
})