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
    doInit: function(component, event, helper) {
        var body = component.getValue("v.body");
        for (var i = 0; i < body.getLength(); i++) {
            var c = body.getValue(i);
            if (c.getDef().getAttributeDefs().getDef("parent")) {
                c.setValue("v.parent", [component]);
            }
        }
    },
    
    trigger: function(component, event, helper) {
        var index = event.getParam("focusItemIndex");
        helper.toggleMenuVisible(component, index);
    },
    
    handleMenuExpand: function(component, event, helper) {
        document.body.addEventListener(helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
        document.body.addEventListener(helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component));
        
    },
    
    handleMenuCollapse: function(component, event, helper) {
        document.body.removeEventListener(helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
        document.body.removeEventListener(helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component));
    }
})
