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
    MonthLabels: [{
        fullName: "January",
        shortName: "Jan"
    }, {
        fullName: "February",
        shortName: "Feb"
    }, {
        fullName: "March",
        shortName: "Mar"
    }, {
        fullName: "April",
        shortName: "Apr"
    }, {
        fullName: "May",
        shortName: "May"
    }, {
        fullName: "June",
        shortName: "Jun"
    }, {
        fullName: "July",
        shortName: "Jul"
    }, {
        fullName: "August",
        shortName: "Aug"
    }, {
        fullName: "September",
        shortName: "Sep"
    }, {
        fullName: "October",
        shortName: "Oct"
    }, {
        fullName: "November",
        shortName: "Nov"
    }, {
        fullName: "December",
        shortName: "Dec"
    }],
    
    focusDate: function(component) {
        var grid = component.find("grid");
        var e = grid.get("e.focus");
        e.fire();
    },
    
    getOnClickEndFunction : function(component) {
        if ($A.util.isUndefined(component._onClickEndFunc)) {
            var helper = this;
            var f = function(event) {
                // ignore gestures/swipes; only run the click handler if it's a click or tap
                var clickEndEvent;
            
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touchIdFound = false;
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        clickEndEvent = event.changedTouches[i];
                        if (clickEndEvent.identifier === component._onStartId) {
                            touchIdFound = true;
                            break;
                        }
                    }
                
                    if (helper.getOnClickEventProp("isTouchDevice") && !touchIdFound) {
                        return;
                    }
                } else {
                    clickEndEvent = event;
                }
            
                var startX = component._onStartX, startY = component._onStartY;
                var endX = clickEndEvent.clientX, endY = clickEndEvent.clientY;

                if (Math.abs(endX - startX) > 0 || Math.abs(endY - startY) > 0) {
                    return;
                }
            
                if (!helper.isElementInComponent(component, event.target)) {
                    // Hide the component
                    component.setValue("v.visible", false);
                    var divCmp = component.find("datePicker");
                    if (divCmp) {
                        var elem = divCmp.getElement();
                        $A.util.removeClass(elem, "visible");
                    }
                }
            };
            component._onClickEndFunc = f;
        }
        return component._onClickEndFunc;
    },
    
    getOnClickEventProp: function(prop) {
        // create the cache
        if ($A.util.isUndefined(this.getOnClickEventProp.cache)) {
            this.getOnClickEventProp.cache = {};
        }

        // check the cache
        var cached = this.getOnClickEventProp.cache[prop];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        // fill the cache
        this.getOnClickEventProp.cache["isTouchDevice"] = !$A.util.isUndefined(document.ontouchstart);
        if (this.getOnClickEventProp.cache["isTouchDevice"]) {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "touchstart";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "touchend";
        } else {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "mousedown";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "mouseup";
        }
        return this.getOnClickEventProp.cache[prop];
    },
    
    getOnClickStartFunction: function(component) {
        if ($A.util.isUndefined(component._onClickStartFunc)) {
            var helper = this;
            var f = function(event) {
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touch = event.changedTouches[0];
                    // record the ID to ensure it's the same finger on a multi-touch device
                    component._onStartId = touch.identifier;
                    component._onStartX = touch.clientX;
                    component._onStartY = touch.clientY;
                } else {
                    component._onStartX = event.clientX;
                    component._onStartY = event.clientY;
                }
            };
            component._onClickStartFunc = f;
        }
        return component._onClickStartFunc;
    },
    
    goToNextYear: function(component) {
        var grid = component.find("grid");
        var e = grid.get("e.updateCalendar");
        if (e) {
            e.setParams({monthChange: 0, yearChange: 1, setFocus: false});
            e.fire();
        }
    },
    
    goToPrevYear: function(component) {
	    var grid = component.find("grid");
	    var e = grid.get("e.updateCalendar");
	    if (e) {
	        e.setParams({monthChange: 0, yearChange: -1, setFocus: false});
	        e.fire();
	    }
	},
    
    handleESCKey: function(component, event) {
        var keyCode = event.keyCode;
        if (keyCode == 27) { // Esc key is pressed
            component.setValue("{!v.visible}", false);
        }
    },
    
    isElementInComponent : function(component, targetElem) {
        var componentElements = [];

        //grab all the siblings
        var elements = component.getElements();
        for(var index in elements) {
            if (elements.hasOwnProperty(index)){
                componentElements.push(elements[index]);
            }
        }

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
    
    localizeToday: function(component) {
        var todayCmp = component.find("today");
        if (!todayCmp) {
            return;
        }
        var todayElem = todayCmp.getElement();
        var todayLabel = component.get("m.labelForToday");
        if (!todayLabel) {
            todayLabel = "Today";
        }
        if (todayElem) {
            todayElem.textContent = todayElem.innerText = todayLabel;
        }
    },
    
    getNormalizedLang: function(component) {
        var ret = 'en';
        var lang = [];
        var token = "";
        var langLocale = component.get("m.langLocale");
        if (langLocale) {
            var index = langLocale.indexOf("_");
            while (index > 0) {
                token = langLocale.substring(0, index);
                langLocale = langLocale.substring(index + 1);
                lang.push(token.toLowerCase());
                index = langLocale.indexOf("_");
            }
            langLocale = langLocale.substring(index + 1);
            if (!$A.util.isEmpty(langLocale)) {
                lang.push(langLocale.toLowerCase());
            }
        } else {
            lang.push("en");
        }
        
        if (lang[0] === "zh") {
            ret = lang[0] + "-" + lang[1];
        } else {
            ret = lang[0];
        }
        return ret;
    },
    
    position: function(component) {
        var divCmp = component.find("datePicker");
        var elem = divCmp ? divCmp.getElement() : null;
        if (elem) {
            elem.style.top = "auto";
            var visible = component.get("v.visible");
            if (visible) {
                var elemRect = elem.getBoundingClientRect();
                var viewPort = $A.util.getWindowSize();
                if (elemRect.bottom > viewPort.height) { // no enough space below
                    if (elemRect.height < elemRect.top) { // move above input field
                        elem.style.top = 0 - elemRect.height + "px";
                    } else { // no enough space above either. Put it in the middle of viewport
                        elem.style.top = 0 - elemRect.top + "px";
                    }
                } else {
                    elem.style.top = "auto";
                }
            }
        }
    },
    
    setGridInitialValue: function(component) {
        var initialDate = new Date();
        var value = component.get("v.value");
        if (!$A.util.isUndefinedOrNull(value) && !$A.util.isEmpty(value)) {
            var d = moment(value, "YYYY-MM-DD");
            initialDate = d.toDate();
        }
        var grid = component.find("grid");
        if (grid) {
            grid.setValue("v.selectedDate", initialDate.getFullYear() + "-" + (initialDate.getMonth() + 1) + "-" + initialDate.getDate());
            grid.setValue("v.date", initialDate.getDate());
            grid.setValue("v.month", initialDate.getMonth());
            grid.setValue("v.year", initialDate.getFullYear());
        }
        
        // set initial value to time picker if hasTime is true
        var hasTime = component.getValue("v.hasTime").getBooleanValue();
        if (hasTime) {
            var timePickerCmp = component.find("time");
            if (timePickerCmp) {
                timePickerCmp.setValue("v.hours", component.get("v.hours"));
                timePickerCmp.setValue("v.is24HourFormat", component.get("v.is24HourFormat"));
                timePickerCmp.setValue("v.minutes", component.get("v.minutes"));
            }
        }
    },
    
    updateGlobalEventListeners: function(component) {
        var concreteCmp = component.getConcreteComponent();
        var visible = concreteCmp.get("v.visible");
        if (!concreteCmp._clickStart) {
            concreteCmp._clickStart = concreteCmp.addDocumentLevelHandler(this.getOnClickEventProp("onClickStartEvent"),
                this.getOnClickStartFunction(component), visible);
            concreteCmp._clickEnd = concreteCmp.addDocumentLevelHandler(this.getOnClickEventProp("onClickEndEvent"),
                this.getOnClickEndFunction(component), visible);
        } else {
            concreteCmp._clickStart.setEnabled(visible);
            concreteCmp._clickEnd.setEnabled(visible);
        }
    },
    
    updateMonthYear: function(component, value) {
        var grid = component.find("grid");
        if (grid) {
            var titleCmp = component.find("calTitle");
            if (titleCmp) {
                var elem = titleCmp.getElement();
                if (elem) {
                    var m = grid.get("v.month");
                    var y = grid.get("v.year");
                    //var title = this.MonthLabels[m].fullName + " " + y;
                    var monthLabels = component.get("m.monthLabels");
                    var title = monthLabels[m].fullName + " " + y;
                    elem.textContent = elem.innerText = title;
                }
            }
        }
    } 
})
