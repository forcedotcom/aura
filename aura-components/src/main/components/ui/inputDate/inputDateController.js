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
        // Set default attribute value
        var format = component.get("v.format");
        if (!format) {
            format = $A.getGlobalValueProviders().get("$Locale.dateformat");
        }
        component.setValue("v.format", format);
        component.setValue("v.placeholder", format);
        
        var langLocale = component.get("v.langLocale");
        if (!langLocale) {
            langLocale = $A.getGlobalValueProviders().get("$Locale.langLocale");
        }
        component.setValue("v.langLocale", langLocale);
        
        var value = component.get("v.value");
        if (value) {
            var mDate = moment.utc(value, "YYYY-MM-DD");
            if (mDate.isValid()) {
                component.setValue("v.value", mDate.format("YYYY-MM-DD"));
            }
        }
    },
    
    formatChange: function(component, event, helper) {
        helper.normalizeFormat(component);
    },
    
    langLocaleChange: function(component, event, helper) {
        helper.normalizeLangLocale(component);
    },
    
    openDatePicker: function(cmp, event, helper) {
        helper.displayDatePicker(cmp);
    },
    
    setValue: function(component, event, helper) {
        var dateValue = event.getParam("value");
        if (dateValue) {
            component.setValue("v.value", dateValue);
        }
    }
})