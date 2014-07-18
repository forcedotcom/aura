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
    doInit: function(component, event, helper) {
        var body = component.get("v.body");
        for (var i = 0; i < body.length; i++) {
            var c = body[i];
            if (c.getDef().getAttributeDefs().getDef("parent")) {
                c.set("v.parent", [component]);
            }
        }
    },
    
    trigger: function(component, event, helper) {
        var index = event.getParam("focusItemIndex");
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.toggleMenuVisible(concreteCmp, index, event);
    },
    
    handleMenuExpand: function(component, event, helper) {
        $A.util.on(document.body, helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
        $A.util.on(document.body, helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component));        
    },
    
    handleMenuCollapse: function(component, event, helper) {
        if (document.body.removeEventListener) {
            document.body.removeEventListener(helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
            document.body.removeEventListener(helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component));
        } else if (document.body.detachEvent) {
            document.body.detachEvent(helper.getOnClickEventProp("onClickStartEvent"), helper.getOnClickStartFunction(component));
            document.body.detachEvent(helper.getOnClickEventProp("onClickEndEvent"), helper.getOnClickEndFunction(component));
        }
    }
})
