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
    position: function(component) {
        var element = component.find("timeDropdown").getElement();
        var target = component.get("v.referenceElement");
        if (target && element) {
            component.positionConstraint = this.lib.panelPositioning.createRelationship({
                element: element,
                target: target,
                align: 'left top',
                targetAlign: 'left bottom'
            });
            this.lib.panelPositioning.reposition();
        }
        this.scrollToSelectedTime(component);
    },

    selectTime: function(component, event) {
        var li = event.target || event.srcElement;
        var hours = li.getAttribute("data-hours"),
            minutes = li.getAttribute("data-minutes");
        component.set("v.hours", hours);
        component.set("v.minutes", minutes);
        var setDateTimeEvent = component.getEvent("selectDate");
        if (setDateTimeEvent) {
            setDateTimeEvent.setParams({
                "hours": hours,
                "minutes": minutes
            });
            setDateTimeEvent.fire();
        }

        this.toggleList(component, false);
    },

    toggleList: function(component, visible) {
        component.set("v.visible", visible);
    },

    renderList: function(component) {
        var listCmp = component.find("timeList");
        var listElem = listCmp ? listCmp.getElement() : null;
        if (listElem) {
            //remove all current list elements before adding new ones
            listElem.innerHTML = "";
            var date = new Date();
            var minIncrement = component.get("v.interval"),
                langLocale = component.get("v.langLocale"),
                timeFormat = component.get("v.timeFormat"),
                currentHour = component.get("v.hours"),
                currentMinutes = component.get("v.minutes");

            for (var hour = 0; hour < 24; hour++) {
                for (var minutes = 0; minutes < 60; minutes+=minIncrement) {
                    date.setHours(hour, minutes);
                    var displayValue = $A.localizationService.formatTime(date, timeFormat, langLocale);
                    var selected = currentHour == hour && currentMinutes == minutes;
                    this.appendListElement(listElem, displayValue, hour, minutes, selected);
                }
            }
        }
    },

    updateGlobalEventListeners: function(component) {
        var visible = component.get("v.visible");
        if (!component._clickHandler) {
            component._clickHandler = component.addDocumentLevelHandler("click", this.getOnClickFunction(component), visible);
        } else {
            component._clickHandler.setEnabled(visible);
        }
    },

    getOnClickFunction: function(component) {
        var helper = this;
        var f = function(event) {
            if (!helper.isElementInComponent(component, event.target)) {
                helper.toggleList(component, false);
            }
        }
        return f;
    },

    isElementInComponent : function(component, targetElem) {
        var componentElements = component.getElements();
        //go up the chain until it hits either a sibling or the root
        var currentNode = targetElem;
        do {
            for (var index = 0; index < componentElements.length ; index++) {
                if (componentElements[index] === currentNode) { return true; }
            }
            currentNode = currentNode.parentNode;
        } while(currentNode);

        return false;
    },

    appendListElement: function(listElem, displayValue, hourValue, minuteValue, selected) {
        var entry = document.createElement('li');
        entry.appendChild(document.createTextNode(displayValue));
        entry.setAttribute("aria-selected", selected);
        // set localId to double digit hour/minute in 24h format, e.g. 2330
        var hours = ("0" + hourValue).slice(-2),
            minutes = ("0" + minuteValue).slice(-2);
        entry.setAttribute("data-hours", hours);
        entry.setAttribute("tabindex", 0);
        entry.setAttribute("data-minutes", minutes);
        entry.setAttribute("id", hours + minutes)
        listElem.appendChild(entry);
    },

    scrollToSelectedTime: function(component) {
        window.setTimeout(function () {
            $A.run(function () {
                var hours = component.get("v.hours"),
                    minutes = component.get("v.minutes"),
                    interval = component.get("v.interval"),
                    closestMinute;

                var mod = minutes % interval,
                    quotient = Math.floor(minutes / interval);
                if (mod == 0) {
                    closestMinute = minutes;
                } else {
                    var multiplier = mod < interval / 2 ? quotient : quotient + 1;
                    closestMinute = multiplier * interval;
                    if (closestMinute >= 60) {
                        if (hours == 23) {
                            closestMinute -= interval;
                        } else {
                            closestMinute = 0;
                            hours++;
                        }
                    }
                }
                var time = ("0" + hours).slice(-2) + ("0" + closestMinute).slice(-2);
                if (!$A.util.isUndefinedOrNull(time)) {
                    var elem = document.getElementById(time);
                    if (!$A.util.isUndefinedOrNull(elem)) {
                        //elem.scrollIntoView();
                        elem.focus();
                    }
                }
            })
        }, 0);
    },

    setEventHandlers: function(component) {
        var el = component.find("timeList").getElement();
        $A.util.on(el, "keydown", this.getKeyboardInteractionHandler(component));
        $A.util.on(el, "mousewheel", this.getMousewheelHandler(component));
    },

    removeEventHandlers: function(component) {
        var el = component.find("timeList").getElement();
        $A.util.removeOn(el, "keydown", this.getKeyboardInteractionHandler(component));
        $A.util.removeOn(el, "mousewheel", this.getMousewheelHandler(component));
        delete component._keyboardEventHandler;
        delete component._mousewheelEventHandler;
    },

    getMousewheelHandler: function(component) {
        if (!component._mousewheelEventHandler) {
            component._mousewheelEventHandler = function (event) {
                // modal panel scopes scroll events which results in weird behavior when scrolling the time picker inside it
                event.stopPropagation();
            }
        }
        return component._mousewheelEventHandler;
    },

    getKeyboardInteractionHandler: function(component) {
        var helper = this;
        if (!component._keyboardEventHandler) {
            component._keyboardEventHandler = function(event) {
                if (event.type === "keydown") {
                    if (event.keyCode === 39 || event.keyCode === 40) { // right or down arrow key
                        event.preventDefault();
                        helper.setFocusToNextItem(component, event);
                    } else if (event.keyCode === 37 || event.keyCode === 38) {  // left or up arrow key
                        event.preventDefault();
                        helper.setFocusToPreviousItem(component, event);
                    } else if (event.keyCode === 27) {  // Esc key
                        event.stopPropagation();
                        helper.toggleList(component, false);
                    } else if (event.keyCode === 9) {   // Tab key
                        helper.toggleList(component, false);
                    }else if (event.keyCode == 32 || event.keyCode == 13) {  // space bar or enter
                        event.preventDefault();
                        helper.selectTime(component, event);
                    }
                }
            }
        }
        return component._keyboardEventHandler;
    },

    setFocusToNextItem: function(component, event) {
        var li = event.target || event.srcElement;
        var hours = parseInt(li.getAttribute("data-hours")),
            minutes = parseInt(li.getAttribute("data-minutes")),
            interval = component.get("v.interval"),
            newMinutes;

        newMinutes = minutes + interval;
        if (newMinutes >= 60) {
            if (hours >= 23) {
                return;
            }
            newMinutes = 0;
            hours++;
        }
        var time = ("0" + hours).slice(-2) + ("0" + newMinutes).slice(-2);
        if (!$A.util.isUndefinedOrNull(time)) {
            var elem = document.getElementById(time);
            if (!$A.util.isUndefinedOrNull(elem)) {
                elem.focus();
            }
        }
    },

    setFocusToPreviousItem: function(component, event) {
        var li = event.target || event.srcElement;
        var hours = parseInt(li.getAttribute("data-hours")),
            minutes = parseInt(li.getAttribute("data-minutes")),
            interval = component.get("v.interval"),
            newMinutes;

        newMinutes = minutes - interval;
        if (newMinutes < 0) {
            if (hours <= 0) {
                return;
            }
            newMinutes = 60 - interval;
            hours--;
        }
        var time = ("0" + hours).slice(-2) + ("0" + newMinutes).slice(-2);
        if (!$A.util.isUndefinedOrNull(time)) {
            var elem = document.getElementById(time);
            if (!$A.util.isUndefinedOrNull(elem)) {
                elem.focus();
            }
        }
    }
})