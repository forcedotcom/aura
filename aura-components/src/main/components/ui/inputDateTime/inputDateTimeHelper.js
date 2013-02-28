/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    displayDatePicker: function(component) {
        var currentDate = new Date();
        var value = component.get("v.value");
        var format = component.get("v.format");
        if (value) {
            var mDate = moment.utc(value, format, this.getLangLocale(component));
            if (mDate.isValid()) {
                currentDate = new Date(Date.UTC(mDate.year(), mDate.month(), mDate.date()));
            }
        }
        var datePicker = component.find("datePicker");
        datePicker.setValue("{!v.value}", this.getUTCDateString(currentDate));
        datePicker.setValue("{!v.visible}", true);
    },
    
    /**
     * Get a normalized locale string which is compatible with moment.js
     *
     */
    getLangLocale: function(component) {
        if ($A.util.isUndefinedOrNull(component._langLocale) ||
            $A.util.isEmpty(component._langLocale)) {
            var lang = [];
            var token = "";
            var langLocale = component.get("v.langLocale");
            if (langLocale) {
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
            } else {
                lang.push("en");
            }
            if (lang[0] === "zh") {
                component._langLocale = lang[0] + "-" + lang[1];
            } else {
                component._langLocale = lang[0];
            }
        }
        return component._langLocale;
    },
    
    getUTCDateString: function(date) {
        return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
    }
})