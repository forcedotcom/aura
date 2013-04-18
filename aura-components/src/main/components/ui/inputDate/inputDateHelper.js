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
            var format = component.get("v.format");
            var elem = component.find("inputText").getElement();
            var mDate = moment(value, "YYYY-MM-DD");
            if (mDate.isValid()) {
                elem.value = mDate.format(format);
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
            var format = component.get("v.format");
            var mDisplayValue = moment.utc(value, format);
            ret = mDisplayValue.format("YYYY-MM-DD");
        }
        component.setValue("v.value", ret);
    },
    
    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }
})