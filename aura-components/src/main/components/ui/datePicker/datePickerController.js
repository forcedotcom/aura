/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    closeOnTab: function(component, event, helper) {
        helper.handleESCKey(component, event);
        var keyCode = event.keyCode;
        var shiftKey = event.shiftKey;
        if (keyCode == 9 && shiftKey == true) { // Tab + shift
            component.setValue("v.visible", false);
        }
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
	    var grid = component.find("grid");
	    var e = grid.get("e.updateCalendar");
	    if (e) {
	        e.setParams({monthChange: 0, yearChange: -1, setFocus: false});
	        e.fire();
	    }
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
        var grid = component.find("grid");
        var e = grid.get("e.updateCalendar");
        if (e) {
            e.setParams({monthChange: 0, yearChange: 1, setFocus: false});
            e.fire();
        }
    },
    
    handleKeydown: function(component, event, helper) {
        helper.handleESCKey(component, event);
    },
    
    handleTabToday: function(component, event, helper) {
        var keycode = event.keyCode;
        if (keycode == 9) {
            if (event.shiftKey == true) { // Tab + shift
                event.preventDefault();
                helper.focusDate(component);
            } else { // Tab
                component.setValue("v.visible", false);
            }
        }
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
	
	updateCalendarTitle: function(component, event, helper) {
        var date = new Date();
        date.setFullYear(event.getParam("year"), event.getParam("month"));
        helper.updateMonthYear(component, date.getTime());
    }
})