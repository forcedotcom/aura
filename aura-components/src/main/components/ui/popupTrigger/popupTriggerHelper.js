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
    addTriggerDomEvents : function(component) {
        var events = ["click", "keydown"];
        for (var i=0, len=events.length; i < len; i++) {
            if (!component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }           
        }
    },
    
    /*
     * preEventFiring is a method from ui:interactive that is meant to be overridden
     * it allows developers to respond to dome events that are registered by addTriggerDomeEvents (see above)
     */
    preEventFiring: function(component, event) {
        if (event.type === "keydown") {
            if (event.keyCode === 32) { // space key
                event.preventDefault();
                this.firePopupEvent(component, "e.popupTriggerPress");
            } else if (event.keyCode === 39 || event.keyCode === 40 || event.keyCode === 37 || event.keyCode === 38) { // right, down, left, or up key
            	event.preventDefault();
            	this.firePopupEvent(component, "e.popupTargetShow"); // for key arrows, we want to only show the target since the menu should stay visible so users can interact with it 
            } else if (event.keyCode === 9 || event.keyCode === 27) { // tab or escape 
            	this.firePopupEvent(component, "e.popupTargetHide");
            }
            
            this.firePopupEvent(component, "e.popupKeyboardEvent", {
            	event : event
            });
        }
    },
    
    handleTriggerPress: function(component) {
        this.firePopupEvent(component, "e.popupTriggerPress");
    },
    
    showTarget: function(component) {
    	this.firePopupEvent(component, "e.popupTargetShow");
    },
    
    hideTarget: function(component) {
    	this.firePopupEvent(component, "e.popupTargetHide");
    },
    
    handlePopupToggle: function(component, event) {
    	var triggerParams = event.getParams(),
			localTriggerDiv = component.find('popupTriggerElement').getElement(),
			eventTriggerDiv = triggerParams.component.getElement();
		
		if ($A.util.contains(localTriggerDiv, eventTriggerDiv)) {
			if (triggerParams.show) {
				this.showTarget(component);
			} else {
				this.hideTarget(component);
			}
		}
    },
    
    firePopupEvent: function(component, eventName, params) {
    	var event = component.get(eventName);
    	if (params) {
            event.setParams(params);
        }
        event.fire();
    }
})