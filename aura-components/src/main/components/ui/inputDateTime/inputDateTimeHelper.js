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
    displayDatePicker: function(component) {
        var now = new Date(); // local date
        // Later on, we will use getUTC... methods to get year/month/date
        var currentDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        var outputCmp = component.find("inputText");
        var elem = outputCmp ? outputCmp.getElement() : null;
        var value = elem ? elem.value : null;
        var format = component.get("v.format");
        if (value) {
            var mDate = moment.utc(value, format, this.getLangLocale(component));
            if (mDate.isValid()) {
                currentDate = mDate.toDate();
            }
        }
        this.popUpDatePicker(component, currentDate);
    },
    
    /**
     * This can be overridden by extended component.
     */
    displayDateTime: function(component, displayValue) {
        var outputCmp = component.find("inputText");
        var elem = outputCmp ? outputCmp.getElement() : null;
        if (elem) {
            elem.value = displayValue;
        }
    },
    
    /**
     * Override ui:input.
     *
     */
    doUpdate : function(component, value) {
        var ret = value;
        if (value) {
            var format = component.get("v.format");
            var mDate = moment.utc(value, format, this.getLangLocale(component));
            if (mDate.isValid()) {
                var d = mDate.toDate();
                var timezone = component.get("v.timezone");
                if (timezone == "GMT") {
                    ret = d.toISOString();
                } else {
                    try {
                        var utcDate = WallTime.WallTimeToUTC(timezone, d); // timezone info should already be loaded
                        ret = utcDate.toISOString();
                    } catch (e) {
                        // The timezone id is invalid or for some reason, we can't get timezone info.
                    }
                }
            }
        }
        component.setValue("v.value", ret);
    },
    
    formatDateTime: function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        var value = component.get("v.value");
        if (!value) { // Setting an empty value probably means clear out existing value
            _helper.displayDateTime(component, "");
            return;
        }
        var d = new Date(value);
        var timezone = component.get("v.timezone");
        var format = component.get("v.format");
        if (timezone == "GMT") {
            var mDate = moment.utc(d.getTime());
            if (mDate.isValid()) {
                _helper.displayDateTime(component, mDate.lang(this.getLangLocale(component)).format(format));
            } else {
                _helper.displayDateTime(component, "Invalid date time value");
            }
        } else {
            if (!WallTime.zones[timezone]) {
                // retrieve timezone data from server
                this.getTimeZoneInfo(component, timezone, function() {
                    _helper.updateDisplay(component, d, format, timezone, value);
                });
            } else {
                _helper.updateDisplay(component, d, format, timezone, value);
            }
        }
    },
    
    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },
    
    getUTCDateString: function(date) {
        return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
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
    
    /**
     * retrieve timezone info from server.
     */
    getTimeZoneInfo: function(component, tzId, callback) {
        var a = component.get("c.getTimeZoneInfo");
        a.setParams({
            timezoneId: tzId
        });
        a.setCallback(component, function(action){
            var state = action.getState();
            if(state === "SUCCESS"){
                var ret = action.returnValue;
                if (ret) {
                    WallTime.data = ret; 
                    WallTime.addRulesZones(WallTime.data.rules, WallTime.data.zones);
                }
            }
            callback();
        });
        $A.enqueueAction(a);
    },
    
    getWallDateTime: function(d, timezone) {
        var tzOffset = 0;
        try {
            var tzDate = WallTime.UTCToWallTime(d, timezone);
            tzOffset = tzDate.getTimezoneOffset();
        } catch (e) {
            // The timezone id is invalid or for some reason, we can't get timezone info.
        }
        var mDate = moment.utc(d.getTime() - tzOffset * 60000);
        return mDate.toDate();
    },
    
    popUpDatePicker: function(component, date) {
        var datePicker = component.find("datePicker");
        datePicker.setValue("v.value", this.getUTCDateString(date));
        datePicker.setValue("v.visible", true);
    },
    
    /**
     * This can be overridden by extended component.
     */
    updateDisplay: function(component, d, format, timezone, defaultDisplayValue) {
        var displayValue = defaultDisplayValue;
        var wallDate = this.getWallDateTime(d, timezone); 
        var mDate = moment.utc(wallDate);
        if (mDate.isValid()) {
            displayValue = mDate.lang(this.getLangLocale(component)).format(format);
        } else {
            displayValue = "Invalid date time value";
        }
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayDateTime(component, displayValue);
    }
})