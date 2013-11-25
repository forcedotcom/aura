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
    cancel: function(component, event, helper) {
        component.setValue("v.visible", false);
    },
    
    closeOnTab: function(component, event, helper) {
        helper.handleESCKey(component, event);
        var keyCode = event.keyCode;
        var shiftKey = event.shiftKey;
        if (keyCode == 9 && shiftKey == true) { // Tab + shift
            component.setValue("v.visible", false);
        }
    },
    
    doInit: function(component, event, helper) {
        helper.refreshYearSelection(component);
        helper.localizeToday(component);
        component._windowSize = $A.util.getWindowSize();
    },
    
    focusDateOnTab: function(component, event, helper) {
        helper.handleESCKey(component, event);
        var keyCode = event.keyCode;
        var shiftKey = event.shiftKey;
        if (keyCode == 9 && shiftKey != true) { // Tab
            event.preventDefault();
            helper.focusDate(component);
        }
    },
	
	goToPrevYear: function(component, event, helper) {
	    helper.goToPrevYear(component);
	},
	
	goToPrevMonth: function(component, event, helper) {
        var grid = component.find("grid");
        var e = grid.get("e.updateCalendar");
        if (e) {
            e.setParams({monthChange: -1, yearChange: 0, setFocus: false});
            e.fire();
        }
    },
    
    goToNextMonth: function(component, event, helper) {
        var grid = component.find("grid");
        var e = grid.get("e.updateCalendar");
        if (e) {
            e.setParams({monthChange: 1, yearChange: 0, setFocus: false});
            e.fire();
        }
    },
    
    goToNextYear: function(component, event, helper) {
        helper.goToNextYear(component);
    },
    
    handleKeydown: function(component, event, helper) {
        helper.handleESCKey(component, event);
    },
    
    handleTabToday: function(component, event, helper) {
        var domEvent = event.getParam("domEvent");
        if (domEvent) {
            var keycode = domEvent.keyCode;
            if (keycode == 9) {
                if (domEvent.shiftKey == true) { // Tab + shift
                    domEvent.preventDefault();
                    helper.focusDate(component);
                } else { // Tab
                    component.setValue("v.visible", false);
                }
            }
        }
    },
    
    handleTouchEnd: function(component, event, helper) {
        var startX = component._onTouchStartX;
        var endX = component._onTouchEndX;
        var startY = component._onTouchStartY;
        var endY = component._onTouchEndY;
        if (Math.abs(startX - endX) > 10) { // left/right swipe
            return;
        }
        if ((endY - startY) > 10) { // swipe down
            helper.goToNextYear(component);
        } else if ((startY - endY) > 10) { // swipe up
            helper.goToPrevYear(component);
        }
    },
    
    handleTouchMove: function(component, event, helper) {
        event.preventDefault();
        event.stopPropagation();
        var touch;
        var touchIdFound = false;
        for (var i = 0; i < event.changedTouches.length; i++) {
            touch = event.changedTouches[i];
            if (touch.identifier === component._onTouchStartId) {
                touchIdFound = true;
                break;
            }
        }
        if (touchIdFound) {
            component._onTouchEndX = touch.clientX;
            component._onTouchEndY = touch.clientY; // On Android (Samsung GT), we can't get the position of touchend, 
                                                    // so we have to record it here.
        }
    },
    
    handleTouchStart: function(component, event, helper) {
        var touch = event.changedTouches[0];
        // record the ID to ensure it's the same finger on a multi-touch device
        component._onTouchStartId = touch.identifier;
        component._onTouchStartX = touch.clientX;
        component._onTouchStartY = touch.clientY;
    },
    
    hide: function(component, event, helper) {
        component.setValue("v.visible", false);
    },
    
    selectDate: function(component, event, helper) {
        var selectedDate = event.getParam("value");
        var selectDateEvent = component.getEvent("selectDate");
        selectDateEvent.setParams({"value": selectedDate});
        selectDateEvent.fire();
        component.setValue("v.visible", false);
    },
    
    selectToday: function(component, event, helper) {
        var mDate = moment();
        var selectDateEvent = component.getEvent("selectDate");
        selectDateEvent.setParams({"value": mDate.format("YYYY-MM-DD")});
        selectDateEvent.fire();
        component.setValue("v.visible", false);
    },
    
    set: function(component, event, helper) {
        var setDateTimeEvent = component.getEvent("selectDate");
        if (setDateTimeEvent) {
            // Get date value
            var gridCmp = component.find("grid");
            if (!gridCmp) {
                return;
            }
            var date = gridCmp.get("v.year") + "-" + (gridCmp.get("v.month") + 1) + "-" + gridCmp.get("v.date");
            
            // Get time value
            var timeCmp = component.find("time");
            if (!timeCmp || (timeCmp.getValue("v.isValid").getBooleanValue() === false)) {
                return;
            }
            setDateTimeEvent.setParams({
                "value": date,
                "hours": timeCmp.get("v.hours"),
                "minutes": timeCmp.get("v.minutes")
            });
            setDateTimeEvent.fire();
        }
        component.setValue("v.visible", false);
    },
	
	updateCalendarTitle: function(component, event, helper) {
        var date = new Date();
        date.setFullYear(event.getParam("year"), event.getParam("month"));
        helper.updateMonthYear(component, date.getTime());
    },
    
    yearChange: function(component, event, helper) {
        helper.yearChange(component);
    }
})