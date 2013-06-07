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
    
    formatDate: function(component) {
        var value = component.get("v.value");
        var format = this.getNormalizedFormat(component);
        var langLocale = this.getNormalizedLangLocale(component);
        var displayValue = value;
        if (value) {
            var mDate = moment.utc(value, "YYYY-MM-DD");
            if (mDate.isValid()) {
                displayValue = mDate.lang(langLocale).format(format);
            }
        }
        
        var outputCmp = component.find("span");
        var elem = outputCmp ? outputCmp.getElement() : null;
        if (elem) {
            elem.textContent = elem.innerText = displayValue;
        }
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