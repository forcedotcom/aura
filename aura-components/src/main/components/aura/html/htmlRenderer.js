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
    render : function(component, helper) {
        var placeholder = "auraplaceholder";
        var attributes = component.getAttributes();
        var valueProvider = attributes.getValueProvider();
        var replacements = {};

        var tag = attributes.get("tag");
        var HTMLAttributes = attributes.getValue("HTMLAttributes");
        var ret = document.createElement(tag);

        if (HTMLAttributes && HTMLAttributes.each) {
            // go through all the HTML tag attributes (except class, which is handled specially below)
            HTMLAttributes.each(helper.createHtmlAttribute, { scope: helper, ret: ret, component: component });
        }

        if (ret.tagName.toLowerCase() === "a" && $A.util.isUndefinedOrNull(ret.getAttribute("href"))) {
            ret.setAttribute("href", "javascript:void(0);");
        }

        if (helper.canHaveBody(component)) {
            var body = attributes.getValue("body");
            $A.render(body, ret);
        }

        return ret;
    },

    rerender : function(component, helper) {
        var attributes = component.getAttributes();
        var valueProvider = attributes.getValueProvider();
        var element = component.getElement();
        if (!element) {
            return;
        }

        var expressionService = $A.expressionService;
        var HTMLAttributes = attributes.getValue("HTMLAttributes");
        if (HTMLAttributes && HTMLAttributes.each) {
            HTMLAttributes.each(function(name, ve) {
                // TODO: what if this isn't an expression and changes? doesn't
                // look like it would work...
                if (ve.isExpression()) {
                    var lowerName = name.toLowerCase();
                    if (lowerName !== "height" && lowerName !== "width"
                            && lowerName !== "class"
                            && lowerName.indexOf("on") !== 0) {
                        var value = expressionService.getValue(valueProvider, ve);

                        if (value && value.isDirty()) {
                            var newValue;
                            var oldValue = element[helper.caseAttribute(lowerName)];

                            if (aura.util.arrayIndexOf(helper.SPECIAL_BOOLEANS, lowerName) > -1) {
                                newValue = value.getBooleanValue();
                            } else {
                                newValue = value.unwrap();
                            }

                            if (newValue !== oldValue) {
                            	helper.createHtmlAttribute(lowerName, newValue, { scope: helper, ret: element, component: component });
                            }
                        }
                    }
                }
            });

            var clz = HTMLAttributes.getValue("class");
            if (clz) {
                if (clz.isExpression()) {
                    clz = expressionService.getValue(valueProvider, clz);
                }
                if (clz.isDirty()) {

                    var c = clz.unwrap();
                    if (element.auraClass) {
                        c = c + " " + element.auraClass;
                    }
                    if (!$A.util.isUndefinedOrNull(c) && c !== element["className"]) {
                        element["className"] = c;
                    }
                }

            }
        }

        if (element.tagName.toLowerCase() === "a" && $A.util.isUndefinedOrNull(element.getAttribute("href"))) {
            element.setAttribute("href", "javascript:void(0);");
        }

        if (helper.canHaveBody(component)) {
            var body = attributes.getValue("body");
            $A.rerender(body, element, true);
        }
    },

    afterRender : function(component, helper) {
        if (helper.canHaveBody(component)) {
            $A.afterRender(component.getAttributes().getValue("body"));
        }
    },

    unrender : function(component, helper) {
        // recursively unrender body facet
        // TODO: this should use attribute type checking and iterate through all attributes, not just body

        if (helper.canHaveBody(component)) {
            var attributes = component.getAttributes();
            var value = attributes.getValue('body');
            $A.unrender(value);
        }

        var elements = component.getElements();
        for (var key in elements) {
            var element = elements[key];
            aura.util.removeElement(element);
            delete elements[key];
        }
    }
})
