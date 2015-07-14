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
    init: function(component) {
        var dataProvider = component.get("v.dataProvider[0]");
        if(dataProvider && dataProvider.getModel()) {
            component.set("v.items", dataProvider.get("m.items"));
        }
    },

    handleClick: function(component, event, helper) {
        var targetCmp = helper.getEventSourceOptionComponent(component, event);
        var selectEvt = component.get("e.selectListOption");
        selectEvt.setParams({
            option: targetCmp
        });
        selectEvt.fire();
    },

    handleMouseDown: function(component, event, helper) {
        //prevent loss of focus from the auto complete input
       event.preventDefault();
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
        
        // Should no longer be necessary. We do this in an expression now on the list
        //var list = component.find("list");
        //$A.util.toggleClass(list, "visible", visible);
        
        // auto complete list is hidden.
        if (visible === false) { 
            // Remove loading indicator
            obj["aria-activedescendant"] = "";
            obj["aria-expanded"] = false;
            // De-register list expand/collapse events
            $A.util.removeOn(document.body, helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
            $A.util.removeOn(document.body, helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component));
        } else { // Register list expand/collapse events
            obj["aria-expanded"] = true;
            $A.util.on(document.body, helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
            $A.util.on(document.body, helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component));
            component.get("e.listExpand").fire();
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
