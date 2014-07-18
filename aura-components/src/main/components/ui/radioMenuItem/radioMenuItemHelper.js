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
	handleClick : function(component) {
		var current = component.get("v.selected");
        if (current === false) {
        	component.set("v.selected", !current);
        }
	},

    setSelected : function(component) {
        var concreteCmp = component.getConcreteComponent();
        var selected = concreteCmp.get("v.selected");
        var linkCmp = component.find("link");
        if (linkCmp) {
            var elem = linkCmp.getElement();
            if (selected === true) {
                $A.util.addClass(elem, "selected");
                elem.setAttribute("aria-checked", "true");
                // make sure the sibling radioMenuItems are not checked.
                this.uncheckSiblings(concreteCmp);
            } else {
                $A.util.removeClass(elem, "selected");
                elem.setAttribute("aria-checked", "false");
            }
        }
    },

    uncheckSiblings : function(component) {
    	var parent = component.get("v.parent");
        if (parent && parent.length > 0) {
            p = parent[0];
            var body = p.get("v.childMenuItems");
            for (var i = 0; i < body.length; i++) {
                var c = body[i];
                if (c.isInstanceOf("ui:radioMenuItem") &&
                    $A.util.getBooleanValue(c.get("v.selected")) &&
                    c.getGlobalId() != component.getGlobalId()) {
                    c.set("v.selected", false);
                    break;
                }
            }
        }
    }
})