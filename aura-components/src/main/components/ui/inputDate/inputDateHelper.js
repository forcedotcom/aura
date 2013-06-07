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
    displayValue: function(component) {
        var value = component.get("v.value");
        if (value) {
            var format = this.getNormalizedFormat(component);
            var elem = component.find("inputText").getElement();
            var mDate = moment(value, "YYYY-MM-DD");
            if (mDate.isValid()) {
                elem.value = mDate.lang(this.getNormalizedLangLocale(component)).format(format);
            }
        }
    },
    
    displayDatePicker: function(component) {
        var currentDate = new Date();
        var value = component.get("v.value");
        if (value) {
            var d = moment(value, "YYYY-MM-DD");
            currentDate = d.toDate();
        }
        var datePicker = component.find("datePicker");
        datePicker.setValue("v.value", this.getDateString(currentDate));
        datePicker.setValue("v.visible", true);
    },
    
    /**
     * Override ui:input.
     *
     */
    doUpdate : function(component, value) {
        var ret = value;
        if (value) {
            var format = this.getNormalizedFormat(component);
            var mDisplayValue = moment.utc(value, format, this.getNormalizedLangLocale(component));
            ret = mDisplayValue.format("YYYY-MM-DD");
        }
        component.setValue("v.value", ret);
    },
    
    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },
    
    /**
     * Get a normalized format string which is compatible with moment.js
     *
     */
    getNormalizedFormat: function(component) {
        if ($A.util.isUndefinedOrNull(component._format) || $A.util.isEmpty(component._format)) {
            this.normalizeFormat(component);  
        }
        return component._format;
    },
    
    /**
     * Get a normalized locale string which is compatible with moment.js
     *
     */
    getNormalizedLangLocale: function(component) {
        if ($A.util.isUndefinedOrNull(component._langLocale) || $A.util.isEmpty(component._langLocale)) {
            this.normalizeLangLocale(component);  
        }
        return component._langLocale;
    },
    
    /**
     * Normalize a format string in order to make it compatible with moment.js
     *
     */
    normalizeFormat: function(component) {
        var format = component.get("v.format");
        if (!format) {
            format = $A.getGlobalValueProviders().get("$Locale.dateformat");
        }
        component.setValue("v.placeholder", format);
        component._format = format.replace(/y/g, "Y").replace(/d/g, "D").replace(/E/g, "d").replace(/a/g, "A");
    },
    
    /**
     * Normalize the locale string to moment.js compatible.
     *
     */
    normalizeLangLocale: function(component) {
        var lang = [];
        var token = "";
        var langLocale = component.get("v.langLocale");
        if (!langLocale) {
            langLocale = $A.getGlobalValueProviders().get("$Locale.langLocale");
        }
        
        var index = langLocale.indexOf("_");
        while (index > 0) {
            token = langLocale.substring(0, index);
            langLocale = langLocale.substring(index + 1);
            lang.push(token.toLowerCase());
            index = langLocale.indexOf("_");
        }
        
        langLocale = langLocale.substring(index + 1);
        if (!$A.util.isEmpty(langLocale)) {
            lang.push(langLocale.toLowerCase());
        }
        
        if (lang[0] === "zh") {
            component._langLocale = lang[0] + "-" + lang[1];
        } else {
            component._langLocale = lang[0];
        }
    }
})