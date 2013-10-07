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
    WeekdayLabels: [{
        fullName: "Sunday",
        shortName: "Sun"
    }, {
        fullName: "Monday",
        shortName: "Mon"
    }, {
        fullName: "Tuesday",
        shortName: "Tue"
    }, {
        fullName: "Wednesday",
        shortName: "Wed"
    }, {
        fullName: "Thursday",
        shortName: "Thu"
    }, {
        fullName: "Friday",
        shortName: "Fri"
    }, {
        fullName: "Saturday",
        shortName: "Sat"
    }],
    
    changeCalendar: function(component, localId, deltaMonth, deltaYear) {
        var cellCmp = component.find(localId);
        var date = cellCmp.get("v.label");
        this.changeMonthYear(component, deltaMonth, deltaYear, date);
    },
    
    changeMonthYear: function(component, monthChange, yearChange, date) {
        var currentDate = new Date(component.get("v.year"), component.get("v.month"), date);
        var targetDate = new Date(currentDate.getFullYear() + yearChange,
                                  currentDate.getMonth() + monthChange,
                                  1);
        var daysInMonth = moment(targetDate).daysInMonth();
        if (daysInMonth < date) { // The target month doesn't have the current date. Just set it to the last date.
            date = daysInMonth;
        }
        component.setValue("v.year", targetDate.getFullYear());
        component.setValue("v.month", targetDate.getMonth());
        component.setValue("v.date", date);
        this.updateTitle(component, targetDate.getMonth(), targetDate.getFullYear());
    },
    
    dateCompare: function(date1, date2) {
        if (date1.getFullYear() != date2.getFullYear()) {
            return date1.getFullYear() - date2.getFullYear();
        } else {
            if (date1.getMonth() != date2.getMonth()) {
                return date1.getMonth() - date2.getMonth();
            } else {
                return date1.getDate() - date2.getDate();
            }
        }
    },
    
    /**
     * Java style date comparisons. Compares by day, month, and year only.
     */
    dateEquals: function(date1, date2) {
        return date1 && date2 && this.dateCompare(date1, date2) === 0;
    },
    
    /**
     * Find the cell component for a specific date in a month.
     * @date - Date object
     */
    findDateComponent: function(component, date) {
        var firstDate = new Date(date.getTime());
        firstDate.setDate(1);
        var initialPos = firstDate.getDay();
        var pos = initialPos + date.getDate() - 1;
        return component.find(pos);
    },
    
    /**
     * generates the days for the current selected month.
     */
    generateMonth: function(component) {
        var dayOfMonth = component.get("v.date");
        var month = component.get("v.month");
        var year = component.get("v.year");
        var date = new Date(year, month, dayOfMonth);
        var selectedDate;
        var mDate = moment(component.get("v.selectedDate"), "YYYY-MM-DD");
        if (mDate.isValid()) {
            selectedDate = mDate.toDate();
        }
        var today = new Date();
        
        var d = new Date();
        d.setDate(1);
        d.setFullYear(year);
        d.setMonth(month);
        // java days are indexed from 1-7, javascript 0-6
        // The startPoint will indicate the first date displayed at the top-left
        // corner of the calendar. Negative dates in JS will subtract days from
        // the 1st of the given month
        var startOfWeek = 0;
        var startPoint = startOfWeek - d.getDay() + 1;
        d.setDate(startPoint);
        for (var i = 0; i < 42; i++) {
            var cellCmp = component.find(i);
            if (cellCmp) {
                var dayOfWeek = d.getDay();
                var clazz;
                if (dayOfWeek == 0 || dayOfWeek == 6) {
                    clazz = "weekend";
                } else {
                    clazz = "weekday";
                }
                if (d.getMonth() == month - 1 || d.getFullYear() == year - 1) {
                    clazz += " prevMonth"
                } else if (d.getMonth() == month + 1 || d.getFullYear() == year + 1) {
                    clazz += " nextMonth"
                }
        
                if (this.dateEquals(d, today)) {
                    clazz += " todayDate";
                }
                if (this.dateEquals(d, selectedDate)) {
                    clazz += " selectedDate"
                    cellCmp.setValue("v.tabIndex", 0);              
                } else {
                    cellCmp.setValue("v.tabIndex", -1);
                }
                cellCmp.setValue("v.class", clazz);
                cellCmp.setValue("v.label", d.getDate());
                cellCmp.setValue("v.value", d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
                
                var setFocus = component.get("v._setFocus");
                if (this.dateEquals(d, date) && setFocus === true) {
                    cellCmp.getElement().focus();
                } else {
                    cellCmp.setValue("v.ariaSelected", false);
                }
            }
            d.setDate(d.getDate() + 1);
        }
        component.setValue("v._setFocus", true);
    },
    
    getEventTarget: function(e) {
        return (window.event) ? e.srcElement : e.target;
    },
    
    goToFirstOfMonth: function(component, localId) {
        var date = new Date(component.get("v.year"), component.get("v.month"), 1);
        var targetId = date.getDay();
        var targetCellCmp = component.find(targetId);
        targetCellCmp.getElement().focus();
        component.setValue("v.date", 1);
    },
    
    goToLastOfMonth: function(component, localId) {
        var date = new Date(component.get("v.year"), component.get("v.month") + 1, 0);
        var targetCellCmp = this.findDateComponent(component, date);
        if (targetCellCmp) {
            targetCellCmp.getElement().focus();
            component.setValue("v.date", targetCellCmp.get("v.label"));
        }
    },
    
    handleArrowKey: function(component, localId, deltaDays) {
        var currentYear = component.get("v.year");
        var currentMonth = component.get("v.month");
        var cellCmp = component.find(localId);
        var date = new Date(currentYear, currentMonth, cellCmp.get("v.label"));
        var targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + deltaDays);
        if (targetDate.getFullYear() != currentYear || targetDate.getMonth() != currentMonth) {
            component.setValue("v.year", targetDate.getFullYear());
            component.setValue("v.month", targetDate.getMonth());
            component.setValue("v.date", targetDate.getDate());
            this.updateTitle(component, targetDate.getMonth(), targetDate.getFullYear());
        } else {
            var targetCellCmp = component.find(parseInt(localId) + deltaDays);
            targetCellCmp.getElement().focus();
            component.setValue("v.date", targetCellCmp.get("v.label"));
        }
    },
    
    handleESC: function(component) {
        component.get("e.hide").fire();
    },
    
    /**
     * Support keyboard interaction.
     *
     */
    handleKeydown: function(component, event) {
        var cellCmp = event.getSource();
        var keyCode = event.getParam("keyCode");
        var shiftKey = event.getParam("shiftKey");
        var ctrlKey = event.getParam("ctrlKey");
        var domEvent = event.getParam("domEvent");
        var localId = cellCmp.getLocalId();
        
        if (keyCode == 39) {  // right arrow key
            domEvent.preventDefault();
            this.handleArrowKey(component, localId, 1);
        } else if (keyCode == 37) { // left arrow key
            domEvent.preventDefault();
            this.handleArrowKey(component, localId, -1);
        } else if (keyCode == 38) { // up arrow key
            domEvent.preventDefault();
            this.handleArrowKey(component, localId, -7);
        } else if (keyCode == 40) { // down arrow key
            domEvent.preventDefault();
            this.handleArrowKey(component, localId, 7);
        } else if (keyCode == 9 && shiftKey == true) { // Tab + shift
            //component.get("e.hide").fire();
        } else if (keyCode == 33 && shiftKey == true) { // Page Up + shift
            this.changeCalendar(component, localId, 0, -1);
        } else if (keyCode == 34 && shiftKey == true) { // Page Down + shift
            this.changeCalendar(component, localId, 0, 1);
        } else if (keyCode == 32) { // space bar
            this.handleSpaceBar(component, event);
        } else if (keyCode == 36) { // Home key
            domEvent.stopPropagation();
            this.goToFirstOfMonth(component, localId);
        } else if (keyCode == 35) { // End key
            domEvent.stopPropagation();     
            this.goToLastOfMonth(component, localId);
        } else if (keyCode == 33 && shiftKey != true) { // Page Up
            this.changeCalendar(component, localId, -1, 0);
        } else if (keyCode == 34 && shiftKey != true) { // Page Down
            this.changeCalendar(component, localId, 1, 0            );
        } else if (keyCode == 27) { // ESC
            domEvent.stopPropagation();
            this.handleESC(component);
        }
    },
    
    handleSpaceBar: function(component, event) {
        var hasTime = component.getValue("v.hasTime").getBooleanValue();
        if (hasTime === true) {
            return;
        }
        this.selectDate(component, event);
    },
    
    renderGrid: function(component) {
        this.generateMonth(component);
    },
    
    selectDate: function(component, event) {
        var source = event.getSource();
        var hasTime = component.getValue("v.hasTime").getBooleanValue();
        if (hasTime === true) {
            var firstDate = new Date(component.get("v.year"), component.get("v.month"), 1);
            var firstDateId = parseInt(firstDate.getDay());
            
            var lastDate = new Date(component.get("v.year"), component.get("v.month") + 1, 0);
            var lastDateCellCmp = this.findDateComponent(component, lastDate);
            var lastDateId = parseInt(lastDateCellCmp.getLocalId());
            
            var currentId = parseInt(source.getLocalId());
            var currentDate = source.get("v.label");
            if (currentId < firstDateId) { // previous month
                var targetDate = new Date(component.get("v.year"), component.get("v.month") - 1, currentDate);
                component.setValue("v.year", targetDate.getFullYear());
                component.setValue("v.month", targetDate.getMonth());
                component.setValue("v.date", targetDate.getDate());
                this.updateTitle(component, targetDate.getMonth(), targetDate.getFullYear());
            } else if (currentId > lastDateId) { // next month
                var targetDate = new Date(component.get("v.year"), component.get("v.month") + 1, currentDate);
                component.setValue("v.year", targetDate.getFullYear());
                component.setValue("v.month", targetDate.getMonth());
                component.setValue("v.date", targetDate.getDate()); 
                this.updateTitle(component, targetDate.getMonth(), targetDate.getFullYear());
            } else {
                component.setValue("v.date", currentDate);
            }
            component.setValue("v.selectedDate", component.get("v.year") + "-" + (component.get("v.month") + 1) + "-" + component.get("v.date"));
        } else { // fire selectdate event
            var selectDateEvent = component.getEvent("selectDate");
            selectDateEvent.setParams({"value": source.get("v.value")});
            selectDateEvent.fire();
        }
    },
    
    setFocus: function(component) {
        var date = component.get("v.date");
        if (!date) {
            date = 1;
        }
        var year = component.get("v.year");
        var month = component.get("v.month");
        var cellCmp = this.findDateComponent(component, new Date(year, month, date));
        if (cellCmp) {
            cellCmp.getElement().focus();
        }
    },
    
    updateTitle: function(component, month, year) {
        var updateTitleEvent = component.get("e.updateCalendarTitle");
        updateTitleEvent.setParams({month: month, year: year});
        updateTitleEvent.fire();
    }
})