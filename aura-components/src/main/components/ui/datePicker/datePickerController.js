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
    cancel: function (component, event, helper) {
        helper.hide(component, true);
    },

    handleVisible: function (component, event, helper) {
        helper.toggleVisibility(component);
    },

    // prevent clicks in date picker from bubbling up
    // to body and closing panels and such.
    trapClicks: function (component, event) {
        $A.util.squash(event, true);
    },

    highlightRange: function (component, event) {
        var params = event.getParam('arguments');
        if (params) {
            var grid = component.find("grid");
            grid.highlightRange(params.rangeStart, params.rangeEnd, params.highlightClass);
        }
    },

    goToPrevMonth: function (component, event, helper) {
        helper.goToPrevMonth(component);
    },

    goToNextMonth: function (component, event, helper) {
        helper.goToNextMonth(component);
    },

    handleKeydown: function (component, event, helper) {
        helper.handleKeydown(component, event);
    },

    show: function (component, event, helper) {
        helper.show(component, event);
    },

    hide: function (component, event, helper) {
        helper.closeOnClickOut(component);
    },

    focus: function (component, event, helper) {
        helper.focusDate(component);
    },

    setDate: function (component, event, helper) {
        helper.setDate(component, event);
    },

    setDateTime: function (component, event, helper) {
        helper.setDateTime(component, event);
    },

    updateCalendarTitle: function (component, event, helper) {
        helper.updateMonthYear(component, new Date(event.getParam("year"), event.getParam("month"), 1));
    },

    yearChange: function (component, event, helper) {
        helper.yearChange(component);
    }
})// eslint-disable-line semi