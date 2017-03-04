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
    attachToDocumentBody: function (component) {
        var body = document.getElementsByTagName("body")[0];
        var elem = component.getElement();
        body.appendChild(elem);
    },

    show: function (component, event) {
        var params = event.getParam("arguments");
        if (params) {
            component.set("v.value", params.value);

            if (params.referenceElement) {
                component.set("v.referenceElement", params.referenceElement);
            }

            component.set("v.visible", true);

            if (params.focus) {
                this.focusDate(component);
            }
        }
    },

    focusDate: function (component) {
        //TODO make sure the datepicker is actually visible
        window.requestAnimationFrame($A.getCallback(function () {
            component.find("grid").focus();
        }));

    },

    goToPrevMonth: function (component) {
        this.changeCalendar(component, -1, 0);
    },

    goToNextMonth: function (component) {
        this.changeCalendar(component, 1, 0);
    },

    changeCalendar: function (component, monthChange, yearChange) {
        var grid = component.find("grid");
        grid.changeCalendar(monthChange, yearChange);
    },

    handleKeydown: function (component, event) {
        if (component.get("v.closeOnClickOut")) {
            var keyCode = event.keyCode;
            var elem = event.target || event.srcElement;
            if (keyCode === 9 && event.shiftKey === true) { // shift + tab
                if ($A.util.hasClass(elem, "prevMonth")) {
                    $A.util.squash(event, true);
                    this.closeOnClickOut(component);
                }
            } else if (keyCode === 27) { // Esc key is pressed
                this.closeOnClickOut(component);
            }
        }
    },

    updateGlobalEventListeners: function (component) {
        var visible = component.get("v.visible");
        if (component.get("v.closeOnClickOut")) {
            if (!component._clickHandler) {
                component._clickHandler = component.addDocumentLevelHandler("mouseup", this.getOnClickFunction(component), visible);
            } else {
                component._clickHandler.setEnabled(visible);
            }
        }
    },

    getOnClickFunction: function (component) {
        var f = function (event) {
            if (!this.isElementInComponent(component, event.target)) {
                this.hide(component, false);
            }
        }.bind(this);
        return f;
    },

    isElementInComponent: function (component, targetElem) {
        var componentElements = component.getElements();
        //go up the chain until it hits either a sibling or the root
        var currentNode = targetElem;
        do {
            for (var index = 0; index < componentElements.length; index++) {
                if (componentElements[index] === currentNode) {
                    return true;
                }
            }

            currentNode = currentNode.parentNode;
        } while (currentNode);
        return false;
    },

    position: function (component) {
        var divCmp = component.find("datePicker");
        var elem = divCmp ? divCmp.getElement() : null;
        var visible = component.get("v.visible");
        var referenceElem = component.getConcreteComponent().get("v.referenceElement");

        if (elem && visible) {
            if ($A.get("$Browser.isPhone")) {
                this.attachToDocumentBody(component);
                var scrollerDivCmp = component.find("scroller");
                var scrollerElem = scrollerDivCmp ? scrollerDivCmp.getElement() : null;
                if (scrollerElem) { // Set scroller div height to make it scrollable.
                    scrollerElem.style.height = $A.util.getWindowSize().height + "px";
                }

            } else if (!$A.util.isUndefinedOrNull(referenceElem)) {

                if ($A.util.isEmpty(elem.style.top)) {
                    // this is just an approximation for the initial position of the datepicker. The positioning library
                    // will take care of the correct position. See W-2993774
                    elem.style.top = referenceElem.getBoundingClientRect().bottom + window.pageYOffset + "px";
                }

                if ($A.util.isEmpty(elem.style.left)) {
                    elem.style.left = referenceElem.getBoundingClientRect().left + "px";
                }

                if (!component.positionConstraint) {
                    var referenceVerticalAlign = "bottom";
                    var elementVerticalAlign = "top";
                    var horizontalAlign = "left";

                    if (this.shouldFlip(elem, referenceElem)) {
                        referenceVerticalAlign = "top";
                        elementVerticalAlign = "bottom";
                    }

                    if (this.shouldAlignToRight(elem, referenceElem)) {
                        horizontalAlign = "right";
                    }

                    var referenceElementAlign = horizontalAlign + " " + referenceVerticalAlign;
                    var elementAlign = horizontalAlign + " " + elementVerticalAlign;

                    component.positionConstraint = this.lib.panelPositioning.createRelationship({
                        element: elem,
                        target: referenceElem,
                        appendToBody: true,
                        scrollableParentBound: true,
                        align: elementAlign,
                        targetAlign: referenceElementAlign
                    });
                }
                this.lib.panelPositioning.reposition();
            }
        }
    },

    shouldFlip: function (element, targetElement) {
        var viewPort = $A.util.getWindowSize();
        var elemRect = element.getBoundingClientRect();
        var referenceElemRect = targetElement.getBoundingClientRect();
        var height = typeof elemRect.height !== 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;

        if (referenceElemRect.top >= height         // enough space above
            && (viewPort.height - referenceElemRect.bottom) < height) { // not enough space below
            return true;
        }
        return false;
    },

    shouldAlignToRight: function (element, targetElement) {
        var viewPort = $A.util.getWindowSize();
        var elemRect = element.getBoundingClientRect();
        var referenceElemRect = targetElement.getBoundingClientRect();
        var width = typeof elemRect.width !== 'undefined' ? elemRect.width : elemRect.right - elemRect.left;

        if (referenceElemRect.right >= width         // enough space on the left
            && (viewPort.width - referenceElemRect.left) < width) { // not enough space on the right
            return true;
        }
        return false;
    },

    refreshYearSelection: function (component) {
        if (!$A.util.getBooleanValue(component._yearListInitialized)) {
            var minY = component.get("v.minYear");
            var maxY = component.get("v.maxYear");

            var sampleDate = new Date();
            var currentYear = sampleDate.getFullYear();

            if (!minY) {
                minY = currentYear - 100;
            }
            sampleDate.setFullYear(minY);
            minY = $A.localizationService.translateToOtherCalendar(sampleDate).getFullYear();

            if (!maxY) {
                maxY = currentYear + 30;
            }
            sampleDate.setFullYear(maxY);
            maxY = $A.localizationService.translateToOtherCalendar(sampleDate).getFullYear();

            var yearTitleCmp = component.find("yearTitle");
            var selectElem = yearTitleCmp ? yearTitleCmp.getElement() : null;
            if (selectElem) {
                selectElem.setAttribute("id", yearTitleCmp.getGlobalId());
                for (var i = minY; i <= maxY; i++) {
                    selectElem.options[selectElem.options.length] = new Option(i + "", i + "");
                }
            }
            component._yearListInitialized = true;
        }
    },

    setInitialValuesOnChildren: function (component) {
        var value = component.get("v.value");
        this.setGridValue(component, value);
        this.setTimePickerInitialValues(component);
    },

    setGridValue: function (component, value) {
        component.find("grid").setSelectedDate(value);
    },

    setInitialFocus: function (component) {
        if (component.get("v.setFocus")) {
            this.focusDate(component);
        }
    },

    // set initial value to time picker if hasTime is true
    setTimePickerInitialValues: function (component) {
        var hasTime = $A.util.getBooleanValue(component.get("v.hasTime"));
        if (hasTime) {
            var timePickerCmp = component.find("time");
            if (timePickerCmp) {
                timePickerCmp.set("v.hours", component.get("v.hours"));
                timePickerCmp.set("v.is24HourFormat", component.get("v.is24HourFormat"));
                timePickerCmp.set("v.minutes", component.get("v.minutes"));
            }
        }
    },

    initializeMonthYear: function (component, value) {
        if ($A.util.isEmpty(value)) {
            value = this.getDateStringFromGrid(component);
        }

        var date = $A.localizationService.parseDateTime(value, "YYYY-MM-DD");

        if (date) {
            this.updateMonthYear(component, date);
        }
    },

    updateMonthYear: function (component, date) {
        date = $A.localizationService.translateToOtherCalendar(date);
        var isDesktop = $A.get("$Browser.formFactor") === "DESKTOP";
        if (!isDesktop) {
            this.updateMobileMonth(component, date);
        } else {
            var titleElem = component.find("calTitle").getElement();
            if (titleElem) {
                var monthLabels = $A.get("$Locale.nameOfMonths");
                var title = monthLabels[date.getMonth()].fullName;
                var textContent = titleElem.textContent || titleElem.innerText;
                if (textContent !== title) {
                    $A.util.setText(titleElem, title);
                }
            }
        }
        //TODO maybe shouldn't even get here if the element is undefined
        var selectElem = component.find("yearTitle").getElement();
        if (selectElem) {
            selectElem.value = date.getFullYear() + "";
        }
    },

    updateMobileMonth: function (component, date) {
        var monthTitleCmp = component.find("monthTitle");
        var monthLabels = $A.get("$Locale.nameOfMonths");
        monthTitleCmp.set("v.value", monthLabels[date.getMonth()].fullName);
    },

    yearChange: function (component) {
        var grid = component.find("grid");
        var yearCmp = component.find("yearTitle");
        //TODO is this needed
        if (grid && yearCmp) {
            var year = parseInt(grid.get("v.year"), 10);

            var selectedYear = parseInt(yearCmp.getElement().value, 10);
            var sampleDate = new Date();
            sampleDate.setFullYear(selectedYear);
            selectedYear = $A.localizationService.translateFromOtherCalendar(sampleDate).getFullYear();

            grid.changeCalendar(0, selectedYear - year);
        }
    },

    toggleVisibility: function (component) {
        var helper = this;
        this.lib.panelPositioning.reposition();
        if (component.get("v.visible") === true) {
            var element = component.getElement();
            if (element) {
                element.style.opacity = 0;
            }
            setTimeout($A.getCallback(function () {
                if (component.isValid()) {
                    helper.position(component);
                    component.getElement().style.opacity = 1;
                }
            }), 10);
        }
    },

    closeOnClickOut: function (component) {
        if (component.get("v.closeOnClickOut")) {
            this.hide(component, true);
        }
    },

    hideOnSelect: function (component) {
        if (component.get("v.hideOnSelect")) {
            this.hide(component, true);
        }
    },

    hide: function (component, shouldFocusReferenceElem) {
        if (component._clickHandler) {
            component._clickHandler.setEnabled(false);
        }
        component.set("v.visible", false);

        this.unposition(component);
        if ($A.get("$Browser.formFactor") === "DESKTOP" && shouldFocusReferenceElem) {
            var referenceElem = component.get("v.referenceElement");
            if (!$A.util.isUndefinedOrNull(referenceElem)) {
                referenceElem.focus();
            }
        }
    },

    getDateStringFromGrid: function (component) {
        var gridCmp = component.find("grid");
        return gridCmp.get("v.year") + "-" + (gridCmp.get("v.month") + 1) + "-" + gridCmp.get("v.date");
    },

    // re-fire the date selected from the grid, and maybe hide the picker
    setDate: function (component, event) {
        component.getEvent("selectDate").fire({
            "value": event.getParam("value")
        });
        this.hideOnSelect(component);
    },

    // fire the date selected from the grid, when datepicker has time.
    setDateTime: function (component) {
        // Get date value
        var gridCmp = component.find("grid");
        if (!gridCmp) {
            return;
        }
        var date = this.getDateStringFromGrid(component);

        // Get time value
        var timeCmp = component.find("time");
        if (!timeCmp || ($A.util.getBooleanValue(timeCmp.get("v.isValid")) === false)) {
            return;
        }
        component.getEvent("selectDate").fire({
            "value": date,
            "hours": timeCmp.get("v.hours"),
            "minutes": timeCmp.get("v.minutes")
        });

        this.hide(component, true);
    },

    unposition: function (component) {
        if (component.positionConstraint) {
            component.positionConstraint.destroy();
            component.positionConstraint = undefined;
        }
    }
})// eslint-disable-line semi
