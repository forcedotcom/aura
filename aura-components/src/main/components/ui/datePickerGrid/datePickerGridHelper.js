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
    NUM_COLUMNS: 7,
    NUM_ROWS: 6,

    FORMAT: "YYYY-MM-DD",

    initializeGrid: function (component, todayString) {
        var initialDate = new Date();
        var value = component.get("v.selectedDate");

        if (!$A.util.isEmpty(value)) {
            initialDate = this.getDateFromString(value);
        } else if (todayString) {
            initialDate = this.getDateFromString(todayString);
        }
        this.setCalendarAttributes(component, initialDate);
        this.updateTitle(component, initialDate.getMonth(), initialDate.getFullYear());
        component.set("v._today", todayString);

        // localize the today label
        this.localizeToday(component);
    },

    setCalendarAttributes: function (component, date) {
        component.set("v.date", date.getDate());
        component.set("v.month", date.getMonth());
        component.set("v.year", date.getFullYear());
    },

    localizeToday: function (component) {
        if (component.get("v.showToday")) {
            var todayLabel = $A.get("$Locale.labelForToday");
            if (!todayLabel) {
                todayLabel = "Today";
            }
            $A.util.setText(component.find("today").getElement(), todayLabel);
        }
    },

    changeMonthYear: function (component, monthChange, yearChange, date) {
        var targetDate = new Date(
            component.get("v.year") + yearChange,
            component.get("v.month") + monthChange,
            date);

        var daysInMonth = moment(targetDate).daysInMonth();
        if (daysInMonth < date) { // The target month doesn't have the current date. Just set it to the last date.
            targetDate.setDate(daysInMonth);
        }
        this.changeRenderedCalendar(component, targetDate);
    },

    changeRenderedCalendar: function (component, newDate) {
        this.setCalendarAttributes(component, newDate);
        this.updateTitle(component, newDate.getMonth(), newDate.getFullYear());
        this.updateCalendar(component);
    },

    highlightRange: function (component, rangeStart, rangeEnd, highlightClass) {
        component.set("v.rangeStart", rangeStart);
        component.set("v.rangeEnd", rangeEnd);
        component.set("v.highlightClass", highlightClass);
        this.updateCalendar(component);
    },

    createCalendarHeader: function (component) {
        var weekdayLabels = this.getNameOfWeekDays();
        var headerElement = component.find("tableHead").getElement();
        var trElement = $A.util.createHtmlElement("tr");
        for (var j = 0; j < this.NUM_COLUMNS; j++) {
            var thElement = $A.util.createHtmlElement("th", {
                "scope": "col",
                "class": "dayOfWeek"
            });
            var textNode = document.createTextNode(weekdayLabels[j].shortName);
            $A.util.appendChild(textNode, thElement);
            $A.util.appendChild(thElement, trElement);
        }
        $A.util.clearNode(headerElement);
        $A.util.appendChild(trElement, headerElement);
    },

    createCalendarBody: function (component) {
        var cellAttributes = this.calculateCellAttributes(component);

        var calendarBody = [];

        var f = function (createdComponents) {
            this.addRowComponents(component, createdComponents, calendarBody);
        }.bind(this);

        for (var i = 0; i < this.NUM_ROWS; i++) {
            var weekCells = cellAttributes[i];
            var rowComponents = [];
            var rowClass;

            for (var j = 0; j < this.NUM_COLUMNS; j++) {
                var dateCellAttributes = weekCells[j];
                var dateCellConfig = ["markup://ui:dayInMonthCell", dateCellAttributes];
                rowComponents.push(dateCellConfig);

                rowClass = dateCellAttributes["trClass"];
            }

            var rowConfig = {
                "tag": "tr",
                "aura:id": "calRow" + (i + 1),
                "HTMLAttributes": {"class": "calRow " + rowClass}
            };
            var rowComp = ["markup://aura:html", rowConfig];
            rowComponents.unshift(rowComp);

            $A.componentService.createComponents(rowComponents, f);
        }
        component.set("v.gridBody", calendarBody);
    },

    addRowComponents: function (component, rowComponents, calendarBody) {
        //need to explicitly index components due to W-2529066
        for (var i = 0; i < rowComponents.length; i++) {
            var rowComponent = rowComponents[i];
            component.index(rowComponent.getLocalId(), rowComponent.getGlobalId());
        }

        var trNode = rowComponents[0];
        trNode.set("v.body", rowComponents.splice(1));
        calendarBody.push(trNode);
    },

    updateCalendar: function (component) {
        if (!component._calendarCreated) {
            return;
        }

        var cellAttributes = this.calculateCellAttributes(component);

        for (var i = 0; i < this.NUM_ROWS; i++) {
            var weekCells = cellAttributes[i];
            var rowComponent = component.find("calRow" + (i + 1));
            var rowClass;
            for (var j = 0; j < this.NUM_COLUMNS; j++) {
                var dateCellAttributes = weekCells[j];
                var cellId = dateCellAttributes["aura:id"];
                var dateCellCmp = component.find(cellId);

                if (dateCellCmp) {
                    dateCellCmp.updateCell(dateCellAttributes);
                }
                rowClass = dateCellAttributes["trClass"];
            }

            // clear previously set class
            $A.util.removeClass(rowComponent.getElement(), "has-multi-row-selection");
            if (!$A.util.isEmpty(rowClass)) {
                $A.util.addClass(rowComponent.getElement(), rowClass);
            }
        }
    },

    /**
     * generates the days for the current selected month.
     */
    calculateCellAttributes: function (component) {
        var dayOfMonth = component.get("v.date");
        var month = component.get("v.month");
        var year = component.get("v.year");
        // This is the date that is currently displayed in the calendar. Could be different from selectedDate if user
        // navigates to a different year/month
        var renderedDate = new Date(year, month, dayOfMonth);

        var selectedDate = this.getDateFromString(component.get("v.selectedDate"));
        if (!selectedDate) {
            selectedDate = renderedDate;
        }
        var rangeStart = this.getDateFromString(component.get("v.rangeStart"));
        var rangeEnd = this.getDateFromString(component.get("v.rangeEnd"));
        var hasRange = rangeStart && rangeEnd;
        var highlightClass = component.get("v.highlightClass");
        if ($A.util.isEmpty(highlightClass)) {
            highlightClass = "highlight";
        }

        var today = this.getToday(component);
        var date = this.getCalendarStartDate(component, month, year);
        var isSelectedDayInView = selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

        var calendarCells = [];
        for (var i = 0; i < this.NUM_ROWS; i++) {
            var weekCells = [];
            var trClassName = "";
            for (var j = 0; j < this.NUM_COLUMNS; j++) {
                var classList = ["slds-day"];
                var tdClassList = [];

                var dayOfWeek = date.getDay();
                var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                if (isWeekend) {
                    classList.push("weekend");
                } else {
                    classList.push("weekday");
                }

                var isPreviousMonth = date.getMonth() === month - 1 || date.getFullYear() === year - 1;
                var isNextMonth = date.getMonth() === month + 1 || date.getFullYear() === year + 1;
                if (isPreviousMonth) {
                    classList.push("prevMonth");
                    tdClassList.push("slds-disabled-text");
                } else if (isNextMonth) {
                    tdClassList.push("slds-disabled-text");
                    classList.push("nextMonth");
                }

                var isToday = this.dateEquals(date, today);
                if (isToday) {
                    classList.push("todayDate");
                    tdClassList.push("slds-is-today");
                }

                var isSelectedDate = this.dateEquals(date, selectedDate);
                if (isSelectedDate) {
                    classList.push("selectedDate");
                    tdClassList.push("slds-is-selected");
                }

                var isInHighlightRange = hasRange && this.dateInRange(date, rangeStart, rangeEnd);
                if (isInHighlightRange) {
                    classList.push(highlightClass);

                    if (!isSelectedDate) { // only add the class if it hasn't been added above
                        tdClassList.push("slds-is-selected");
                    }

                    if (!this.dateEquals(rangeStart, rangeEnd)) {
                        tdClassList.push("is-selected-multi");
                        trClassName = "has-multi-row-selection";
                    }

                    if (this.dateEquals(date, rangeStart)) {
                        classList.push("start-date");
                    } else if (this.dateEquals(date, rangeEnd)) {
                        classList.push("end-date");
                    }
                }

                var isFirstDayOfMonth = date.getMonth() === month && date.getDate() === 1;
                var tabIndex = isSelectedDate || (!isSelectedDayInView & isFirstDayOfMonth) ? 0 : -1;

                var dateCellAttributes = {
                    "aura:id": (7 * i + j),
                    "tabIndex": tabIndex,
                    "ariaSelected": isSelectedDate,
                    "value": $A.localizationService.formatDate(date, this.FORMAT),
                    "label": date.getDate(),
                    "class": classList.join(" "),
                    "tdClass": tdClassList.join(" "),
                    "trClass": trClassName,
                    "selectDate": component.getReference("c.dateCellSelected")
                };

                weekCells.push(dateCellAttributes);
                date.setDate(date.getDate() + 1);
            }

            calendarCells.push(weekCells);
        }
        return calendarCells;
    },

    goToFirstOfMonth: function (component, highlightedDate) {
        highlightedDate.setDate(1);
        this.focusDate(component, highlightedDate);
        component.set("v.date", highlightedDate.getDate());
    },

    goToLastOfMonth: function (component, highlightedDate) {
        highlightedDate.setMonth(highlightedDate.getMonth() + 1);
        highlightedDate.setDate(0);
        this.focusDate(component, highlightedDate);
        component.set("v.date", highlightedDate.getDate());
    },

    handlePageKey: function (component, highlightedDate, deltaMonth, deltaYear) {
        this.changeMonthYear(component, deltaMonth, deltaYear, highlightedDate.getDate());
        this.focusDate(component, this.getHighlightedDate(component));
    },

    handleArrowKey: function (component, highlightedDate, deltaDays) {
        var currentYear = component.get("v.year");
        var currentMonth = component.get("v.month");
        highlightedDate.setDate(highlightedDate.getDate() + deltaDays);

        if (highlightedDate.getFullYear() !== currentYear || highlightedDate.getMonth() !== currentMonth) {
            this.changeRenderedCalendar(component, highlightedDate);
        } else {
            component.set("v.date", highlightedDate.getDate());
        }

        this.focusDate(component, highlightedDate);
    },

    fireHideEvent: function (component) {
        component.get("e.hide").fire();
    },

    setKeyboardEventHandlers: function (component) {
        var el = component.find("tableBody").getElement();
        $A.util.on(el, "keydown", this.getKeyboardInteractionHandler(component));
    },

    removeKeyboardEventHandlers: function (component) {
        var el = component.find("tableBody").getElement();
        $A.util.removeOn(el, "keydown", this.getKeyboardInteractionHandler(component));
        delete component._keyboardEventHandler;
    },

    getKeyboardInteractionHandler: function (component) {
        if (!component._keyboardEventHandler) {
            component._keyboardEventHandler = function (domEvent) {
                var keyCode = domEvent.keyCode;
                var shiftKey = domEvent.shiftKey;
                var currentDateString = domEvent.target.getAttribute("data-datevalue");

                // if currentDateString is undefined, we're on the today button.
                if (!currentDateString) {
                    if (keyCode === 9 && shiftKey !== true) { // tab
                        this.fireHideEvent(component);
                    } else if (keyCode === 32 || keyCode === 13) { // space or enter key
                        domEvent.preventDefault();
                        this.handleKeyboardSelect(component, component.get("v._today"));
                    } else if (keyCode === 27) { // ESC
                        domEvent.stopPropagation();
                        this.fireHideEvent(component);
                    }
                    return;
                }

                var currentDate = this.getDateFromString(currentDateString);
                // var localId = cellCmp.getLocalId();

                if (keyCode === 39) {  // right arrow key
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, 1);
                } else if (keyCode === 37) { // left arrow key
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, -1);
                } else if (keyCode === 38) { // up arrow key
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, -7);
                } else if (keyCode === 40) { // down arrow key
                    domEvent.preventDefault();
                    this.handleArrowKey(component, currentDate, 7);
                } else if (keyCode === 9 && shiftKey !== true) { // Tab
                    if (!component.get("v.hasTime") && !component.get("v.showToday")) {
                        this.fireHideEvent(component);
                    }
                } else if (keyCode === 33 && shiftKey === true) { // Page Up + shift
                    this.handlePageKey(component, currentDate, 0, -1);
                } else if (keyCode === 34 && shiftKey === true) { // Page Down + shift
                    this.handlePageKey(component, currentDate, 0, 1);
                } else if (keyCode === 32 || keyCode === 13) { // space or enter key
                    domEvent.preventDefault();
                    this.handleKeyboardSelect(component, currentDateString);
                } else if (keyCode === 36) { // Home key
                    domEvent.stopPropagation();
                    this.goToFirstOfMonth(component, currentDate);
                } else if (keyCode === 35) { // End key
                    domEvent.stopPropagation();
                    this.goToLastOfMonth(component, currentDate);
                } else if (keyCode === 33 && shiftKey !== true) { // Page Up
                    this.handlePageKey(component, currentDate, -1, 0);
                } else if (keyCode === 34 && shiftKey !== true) { // Page Down
                    this.handlePageKey(component, currentDate, 1, 0);
                } else if (keyCode === 27) { // ESC
                    domEvent.stopPropagation();
                    this.fireHideEvent(component);
                }
            }.bind(this);
        }
        return component._keyboardEventHandler;
    },

    handleKeyboardSelect: function (component, selectedDateString) {
        var hasTime = $A.util.getBooleanValue(component.get("v.hasTime"));
        if (hasTime === true) {
            return;
        }
        this.handleDateCellSelected(component, selectedDateString);
    },

    handleDateCellSelected: function (component, selectedDate) {
        var hasTime = $A.util.getBooleanValue(component.get("v.hasTime"));
        if (hasTime !== true) {
            // re-fire the event to the datepicker component
            component.getEvent("selectDate").fire({
                "value": selectedDate
            });
        }

        this.selectDate(component, selectedDate);
    },

    selectDate: function (component, newSelectedDate) {
        var currentSelectedDate = this.getDateFromString(component.get("v.selectedDate"));
        var newDate = this.getDateFromString(newSelectedDate);

        if (!newDate) {
            return;
        }

        var change = this.getChangeInMonthYear(component, newDate);
        var monthChange = change[0], yearChange = change[1];
        var hasDifferentMonthOrYear = monthChange !== 0 || yearChange !== 0;

        if (this.dateEquals(currentSelectedDate, newDate) && !hasDifferentMonthOrYear) {
            return;
        }
        component.set("v.selectedDate", newSelectedDate);

        if (hasDifferentMonthOrYear) {
            this.changeMonthYear(component, monthChange, yearChange, newDate.getDate());
            return;
        }

        component.set("v.date", newDate.getDate());
        this.updateCalendar(component);
    },

    focusDate: function (component, date) {
        var cellCmp = this.findDateComponent(component, date);
        if (cellCmp && cellCmp.isRendered()) {
            cellCmp.getElement().focus();
        }
    },

    findDateComponent: function (component, date) {
        var startDatePos = component._startDateId;
        var dateId = startDatePos + date.getDate() - 1;
        return component.find(dateId);
    },

    updateTitle: function (component, month, year) {
        component.get("e.updateCalendarTitle").fire({month: month, year: year});
    },

    getNameOfWeekDays: function () {
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; // The week days in Java is 1 - 7
        var namesOfWeekDays = $A.get("$Locale.nameOfWeekdays");
        var days = [];
        if ($A.util.isNumber(firstDayOfWeek) && $A.util.isArray(namesOfWeekDays)) {
            for (var i = firstDayOfWeek; i < namesOfWeekDays.length; i++) {
                days.push(namesOfWeekDays[i]);
            }
            for (var j = 0; j < firstDayOfWeek; j++) {
                days.push(namesOfWeekDays[j]);
            }
        } else {
            days = namesOfWeekDays;
        }
        return days;
    },

    createCalendar: function (component) {
        component._calendarCreated = false;
        $A.localizationService.getToday($A.get("$Locale.timezone"), function (dateString) {
            if (component.isValid()) {
                this.initializeGrid(component, dateString);
                this.createCalendarBody(component);
                this.createCalendarHeader(component);
                component._calendarCreated = true;
            }
        }.bind(this));
    },

    getToday: function (component) {
        var todayString = component.get("v._today");
        if (todayString) {
            return this.getDateFromString(todayString);
        }
        return new Date();
    },

    getHighlightedDate: function (component) {
        var currentYear = component.get("v.year");
        var currentMonth = component.get("v.month");
        var currentDate = component.get("v.date");

        return new Date(currentYear, currentMonth, currentDate);
    },

    getChangeInMonthYear: function (component, newDate) {
        var currentDate = new Date(component.get("v.year"), component.get("v.month"), 1);

        return [
            newDate.getMonth() - currentDate.getMonth(),
            newDate.getFullYear() - currentDate.getFullYear()
        ];
    },

    getCalendarStartDate: function (component, month, year) {
        var startDate = new Date(year, month, 1);

        // java days are indexed from 1-7, javascript 0-6
        // The startPoint will indicate the first date displayed at the top-left
        // corner of the calendar. Negative dates in JS will subtract days from
        // the 1st of the given month
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; // In Java, week day is 1 - 7

        var startDay = startDate.getDay();
        var startDateId = 0;
        while (startDay !== firstDayOfWeek) {
            startDate.setDate(startDate.getDate() - 1);
            startDay = startDate.getDay();
            startDateId++;
        }
        component._startDateId = startDateId;
        return startDate;
    },

    getDateFromString: function (date) {
        return $A.localizationService.parseDateTime(date, this.FORMAT);
    },

    dateEquals: function (date1, date2) {
        return $A.localizationService.isSame(date1, date2, "day");
    },

    dateInRange: function (date, rangeStart, rangeEnd) {
        return $A.localizationService.isBetween(date, rangeStart, rangeEnd, "day");
    }
});
