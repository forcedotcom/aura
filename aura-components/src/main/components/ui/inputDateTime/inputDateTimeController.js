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
    clearValue: function (component) {
        component.set("v.value", "");
    },

    doInit: function (component, event, helper) {
        helper.init(component);
    },

    openDatePicker: function (component, event, helper) {
        helper.displayDatePicker(component, true);
    },

    openTimePicker: function (component, event, helper) {
        event.stopPropagation();
        helper.displayTimePicker(component, true);
    },

    inputDateClick: function (component, event, helper) {
        helper.displayDatePicker(component, false);
    },

    inputTimeFocus: function (component, event, helper) {
        event.stopPropagation();
        helper.displayTimePicker(component, false);
    },

    pickerKeydown: function (component, event, helper) {
        helper.handlePickerTab(component, event);
    },

    // override ui:handlesDateSelected, used by ui:datePickerManager
    onDateSelected: function (component, event, helper) {
        helper.handleDateSelectionByManager(component, event);
    },

    // override ui:hasManager
    registerManager: function (component, event, helper) {
        helper.registerManager(component, event);
    },

    setDateTime: function (component, event, helper) {
        helper.handleDateTimeSelection(component, event);
    }
})// eslint-disable-line semi
