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
        var children = [];
        // Set "parent" for menu items in body
        var body = component.getValue("v.body");
        for (var i = 0; i < body.getLength(); i++) {
            var c = body.getValue(i);
            if (c.isInstanceOf("ui:menuItem")) {
                children.push(c);
                if (c.getDef().getAttributeDefs().getDef("parent")) {
                    c.setValue("v.parent", [component]);
                }
            } else if (c.isInstanceOf("aura:iteration")) { // support external iteration
                var iters = c.getValue("v.realbody");
                for (var k = 0; k < iters.getLength(); k++) {
                    var iter = iters.getValue(k);
                    if (iter.isInstanceOf("ui:menuItem")) {
                        children.push(iter);
                        if (iter.getDef().getAttributeDefs().getDef("parent")) {
                            iter.setValue("v.parent", [component]);
                        }
                    }
                }
            }
        }
        // Set "parent" for menu items in iteration
        var items = component.find("item");
        if (items && $A.util.isArray(items)) {
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                if (item.isInstanceOf("ui:menuItem")) {
                    children.push(item);
                }
                if (item.getDef().getAttributeDefs().getDef("parent")) {
                    item.setValue("v.parent", [component]);
                }
            }
        }
        component.setValue("v.childMenuItems", children);
    },
    
    visibleChange: function(component, event, helper) {
        var concrete = component.getConcreteComponent();
        var _helper = concrete.getDef().getHelper();
        _helper.visibleChange(concrete);
    }
})