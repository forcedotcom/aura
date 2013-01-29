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
    addTriggerDomEvents : function(component) {
        var events = ["click", "keydown"];
        for (var i=0, len=events.length; i < len; i++) {
            if (!component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }           
        }
    },
    
    preEventFiring: function(component, event) {
        var concreteCmp = component.getConcreteComponent();
        if (event.type === "keydown") {
            if (event.keyCode === 32) {  // space key
                event.preventDefault();
                this.toggleMenu(component);
            } else if (event.keyCode === 39 || event.keyCode === 40) {  // right or down arrow key
                event.preventDefault();
                this.toggleMenu(component);
            } else if (event.keyCode === 37 || event.keyCode === 38) {  // left or up arrow key
                event.preventDefault();
                this.toggleMenu(component, -1);
            }
        }
    },
    
    toggleMenu: function(component, index) {
        if ($A.util.isUndefinedOrNull(index)) {
            index = 0;
        }
        var concrete = component.getConcreteComponent();
        var parent = concrete.getValue("v.parent");
        if (parent && !parent.isEmpty()) {
            p = parent.getValue(0);
            var pressEvent = p.get("e.menuTriggerPress");
            pressEvent.setParams({
                focusItemIndex: index
            }); 
            pressEvent.fire();
        }
    }
})