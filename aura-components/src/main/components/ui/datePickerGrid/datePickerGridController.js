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
    focus: function (component, event, helper) {
        helper.focusDate(component, helper.getHighlightedDate(component));
    },

    changeCalendar: function (component, event, helper) {
        var date = component.get("v.date");
        if (!date) {
            date = 1;
        }
        var params = event.getParam('arguments');
        helper.changeMonthYear(component, params.monthChange, params.yearChange, date);
    },

    dateCellSelected: function (component, event, helper) {
        helper.handleDateCellSelected(component, event.getParam("value"));
    },

    selectToday: function (component, event, helper) {
        helper.handleDateCellSelected(component, component.get("v._today"));
    },

    setSelectedDate: function (component, event, helper) {
        var selectedDate = event.getParam('arguments').selectedDate;
        helper.selectDate(component, selectedDate);
    },

    highlightRange: function (component, event, helper) {
        var params = event.getParam('arguments');
        helper.highlightRange(component, params.rangeStart, params.rangeEnd, params.highlightClass);
    }
});