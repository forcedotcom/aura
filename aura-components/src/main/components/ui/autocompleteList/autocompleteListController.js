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
    handleClick: function(component, event, helper) {
        var targetCmp = helper.getEventSourceComponent(component, event);
        var selectEvt = component.get("e.selectListOption");
        selectEvt.setParams({
            option: targetCmp
        });
        selectEvt.fire();
    },
    
    handleListHighlight: function(component, event, helper) {
        helper.handleListHighlight(component, event);
    },
    
    handlePressOnHighlighted: function(component, event, helper) {
        helper.handlePressOnHighlighted(component, event);
    },
    
    matchText: function(component, event, helper) {
        helper.matchText(component, event.getParam("keyword"));
    },
    
    visibleChange: function(component, event, helper) {
        var obj = {};  
        var visible = component.get("v.visible");
        if (visible === false) { // auto complete list is hidden.
            obj["aria-activedescendant"] = "",
            obj["aria-expanded"] = false;          
            // De-register list expand/collapse events
            $A.util.removeOn(document.body, helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
            $A.util.removeOn(document.body, helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component)); 
        } else { // Register list expand/collapse events
            obj["aria-expanded"] = true;
            $A.util.on(document.body, helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
            $A.util.on(document.body, helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component)); 
        }
        
        // Update accessibility attributes
        var updateAriaEvt = component.get("e.updateAriaAttributes");
        if (updateAriaEvt) {
            updateAriaEvt.setParams({
                attrs: obj
            })
            updateAriaEvt.fire();
        }
    }
})
