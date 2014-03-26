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
    render: function(component, helper){
        if(component.isRendered()){
            $A.unrender(component);
        }

        var ret;
        var value = component.getValue("v.value");
        var created = false;
        if (value) {
            if (value.auraType === "Component" || !value.isLiteral()) {
                // the result is a ComponentDefRef config and we should render it...
                ret = $A.render(value);
                created = true;
                component.lastRenderedValue = value;
            } else if (value.isDefined()) {
                // or it's a raw value that we can just display.
                ret = [document.createTextNode(helper.getTextValue(value))];
                created = true;
            }
        }

        if (!created){
            ret = [document.createTextNode("")];
        }

        return ret;
    },

    rerender : function(component, helper){
        if (!component.isRendered()) {
            return;
        }

        var value = component.getValue("v.value");

        if (value) {
            if (value.auraType === "Component" || !value.isLiteral()) {
                var last = component.lastRenderedValue;
                if (last !== value) {
                    var referenceNode = value.getReferenceNode() || last.getReferenceNode();
                    $A.assert(referenceNode, "referenceNode is required");

                    // We are about to blow away the current reference node so let's create a temporary one
                    var tempReferenceNode = document.createComment("rerender expression: " + component);
                    $A.util.insertBefore(tempReferenceNode, referenceNode);
                    referenceNode = tempReferenceNode;

                    $A.unrender(last);

                    var ret = $A.render(value);
                    $A.util.insertBefore(ret, referenceNode);

                    // Now clean up the temporary reference node
                    $A.util.removeElement(referenceNode);

                    component.lastRenderedValue = value;

                    $A.afterRender(value);
                } else {
                    $A.rerender(value);
                }
            } else {
                if (value.isDirty()){
                    // or it's a raw value that we can just display.
                    var element = component.getElement();

                    // Check for unowned node so IE doesn't crash
                    if (element.parentNode) {
                        element.nodeValue = helper.getTextValue(value);
                    }
                }
            }
        }
	       },

unrender: function(component) {
        // recursively unrender facets
        var attributes = component.getAttributes();
        var value = attributes.getValue("value");
        if (value && (value.auraType === "Component" || !value.isLiteral())) {
            // the result is a ComponentDefRef
            $A.unrender(value);
        }

        var elements = component.getElements();
        for(var key in elements){
            var element = elements[key];
            delete elements[key];
            $A.util.removeElement(element);
        }
    },

    afterRender: function(component){
        var value = component.getValue("v.value");
        if (value && (value.auraType === "Component" || !value.isLiteral())) {
            // the result is a ComponentDefRef
            $A.afterRender(value);
        }
    }
})
