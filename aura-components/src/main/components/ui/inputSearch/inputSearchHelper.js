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
    addEventHandler: function(component) {
        if (this.isEventSupported("search")) {
            this.addDomHandler(component, "search");
        } else { // non-html5 browser, we use the keyup event to mimic a search event
            if (!component.hasEventHandler("keyup")) {
                this.addDomHandler(component, "keyup");
            }
        }
    },
    
    preEventFiring: function(component, event) {
        if (!this.isEventSupported("search") && event.type === "keyup" && event.keyCode === 13) {
            // fire Aura "search" event
            var e = component.getEvent("search");
            e.setParams({
                searchTerm: component.find("search").getElement().value
            });
            e.fire();
        }
        this.handleUpdate(component, event);
    },
    
    fireEvent: function(component, event) {
        var e = component.getEvent(event.type);
        if (event.type === "search") {
            e.setParams({
                searchTerm: component.find("search").getElement().value
            });
        }
        e.fire();
    },
    
    toggleClearButton: function(component) {
        var clearButton = component.find("clearSearchTermButton");
        if (clearButton) {
            var clearButtonElem = clearButton.getElement();
            var searchCmp = component.find("search");
            var elem = searchCmp.getElement();
            if ($A.util.isEmpty(elem.value)) {
                $A.util.addClass(clearButtonElem, "hide");
            } else {
                $A.util.removeClass(clearButtonElem, "hide");
            }
        }
    }
})