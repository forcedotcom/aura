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
    SPECIAL_BOOLEANS: {
        "checked": true,
        "selected": true,
        "disabled": true,
        "readonly": true,
        "multiple": true,
        "ismap": true,
        "defer": true,
        "declare": true,
        "noresize": true,
        "nowrap": true,
        "noshade": true,
        "compact": true,
        "autocomplete": true,
        "required": true
    },

    SPECIAL_CASINGS: {
        "readonly": "readOnly",
        "colspan": "colSpan",
        "rowspan": "rowSpan",
        "bgcolor": "bgColor",
        "tabindex": "tabIndex",
        "usemap": "useMap",
        "accesskey": "accessKey",
        "maxlength": "maxLength",
        "for": "htmlFor",
        "class": "className"
    },

    // "void elements" as per http://dev.w3.org/html5/markup/syntax.html#syntax-elements
    BODYLESS_TAGS: {
        "area": true,
        "base": true,
        "br": true,
        "col": true,
        "command": true,
        "embed": true,
        "hr": true,
        "img": true,
        "input": true,
        "keygen": true,
        "link": true,
        "meta": true,
        "param": true,
        "source": true,
        "track": true,
        "wbr": true
    },

    // string constants used to save and remove click handlers
    NAMES: {
        "domHandler": "fcDomHandler",
        "hashHandler": "fcHashHandler"
    },

    caseAttribute: function (attribute) {
        return this.SPECIAL_CASINGS[attribute] || attribute;
    },

    /**
     * Adds or replaces existing "onclick" handler for the given handlerName.
     *
     * Is used to add independent handlers eg. dom level and hash navigation handling on <a href/>
     */
    addNamedClickHandler: function (element, handler, handlerName) {
        var previousHandler = element[handlerName];
        if ($A.util.isFunction(previousHandler)) {
            $A.util.removeOn(element, "click", previousHandler);
        }

        $A.util.on(element, "click", handler);

        element[handlerName] = handler;
        return previousHandler;
    },

    domEventHandler: function (event) {
        var eventName = "on" + event.type,
            element = event.currentTarget,
            ownerComponent = $A.componentService.getRenderingComponentForElement(element),
            htmlAttributes = ownerComponent.get("v.HTMLAttributes"),
            valueExpression = htmlAttributes[eventName],
            onclickExpression;

        if (eventName === 'ontouchend' || eventName === 'onpointerup' || eventName === 'onMSPointerUp') {
            // Validate that either onclick or ontouchend is wired up to an action never both simultaneously
            onclickExpression = htmlAttributes["onclick"];
            if (!$A.util.isEmpty(onclickExpression)) {
                if ($A.util.isEmpty(valueExpression)) {
                    // Map from touch event to onclick
                    valueExpression = onclickExpression;
                }
            }
        }

        if ($A.util.isExpression(valueExpression)) {
            $A.run(function () {
                var action = valueExpression.evaluate();
                action.runDeprecated(event);
            });
        }
    },

    canHaveBody: function (component) {
        var tag = component.get("v.tag");
        if ($A.util.isUndefinedOrNull(tag)) {
            $A.error("Undefined tag attribute for " + component.getGlobalId());
            return true;
        }
        return !this.BODYLESS_TAGS[tag.toLowerCase()];
    },

    createHtmlAttribute: function (component, element, name, attribute) {
        var value;
        var lowerName = name.toLowerCase();

        // special handling if the attribute is an inline event handler
        if (lowerName.indexOf("on") === 0) {
            var eventName = lowerName.substring(2);
            if (eventName === "click") {
                this.addNamedClickHandler(element, this.domEventHandler, this.NAMES.domHandler);
            } else {
                $A.util.on(element, eventName, this.domEventHandler);
            }
        } else {
            var isSpecialBoolean = this.SPECIAL_BOOLEANS.hasOwnProperty(lowerName);
            if (aura.util.isExpression(attribute)) {
                attribute.addChangeHandler(component, "HTMLAttributes." + name);
                value = attribute.evaluate();
            } else {
                value = attribute;
            }

            if (isSpecialBoolean) {
                value = $A.util.getBooleanValue(value);
            }

            var isHash = $A.util.isString(value) && value.indexOf("#") === 0;
            if (lowerName === "href" && element.tagName === "A" && value && (isHash || $A.util.supportsTouchEvents())) {
                var HTMLAttributes = component.get("v.HTMLAttributes");
                var target = HTMLAttributes["target"];
                if (aura.util.isExpression(target)) {
                    target = target.evaluate();
                }
                this.addNamedClickHandler(element, function () {
                    if (isHash) {
                        $A.run(function () {
                            $A.historyService.set(value.substring(1));
                        })
                    } else {
                        // Make sure that non-hash style hrefs work fine even
                        // when fast clicking is engaged
                        window.open(value, target ? target : "_self");
                    }
                }, this.NAMES.hashHandler);

                var href = "javascript:void(0";
                if ($A.getContext().getMode() !== "PROD") {
                    // for testing we need to be able to easily identify
                    // links from their hrefs
                    href += "/*" + value + "*/";
                }
                href += ");";
                element.setAttribute("href", href);
            } else if (lowerName === "role" || lowerName.lastIndexOf("aria-", 0) === 0) {
                // use setAttribute to render accessibility attributes to markup
                element.setAttribute(name, value);
            } else if (isSpecialBoolean) {
                // handle the boolean attributes for whom presence implies truth
                var casedName = this.caseAttribute(lowerName);
                if (value === false) {
                    element.removeAttribute(casedName);
                    
                    // Support for IE's weird handling of checked (unchecking case):
                    if (casedName === "checked") {
                        element.removeAttribute("defaultChecked");
                    }
                } else {
                    element.setAttribute(casedName, name);

                    // Support for IE's weird handling of checked (checking case):
                    if (casedName === "checked") {
                        element.setAttribute("defaultChecked", true);
                    }
                }
                
                // We still need to make sure that the property is set on the HTMLElement, because it is used for
                // change detection:
                if($A.util.isUndefinedOrNull(value)){
                    value='';
                }
                element[casedName] = value;
            } else {
                // as long as we have a valid value at this point, set
                // it as an attribute on the DOM node
                // IE renders null value as string "null" for input (text)
                // element, we have to work around that.
                if (!aura.util.isUndefined(value) && !($A.util.isIE && element.tagName === "INPUT" && lowerName === "value" && value === null)) {
                    var casedAttribute = this.caseAttribute(lowerName);
                    var lowerName = name.toLowerCase();
                    if (lowerName === "style" && $A.util.isIE) {
                        element.style.cssText = value;
                    } else if (lowerName === "type" || lowerName === "href" || lowerName === "style" || lowerName.indexOf("data-") === 0) {
                        // special case we have to use "setAttribute"
                        element.setAttribute(casedAttribute, value);
                    } else {
                        if ($A.util.isUndefinedOrNull(value)) {
                            value = '';
                        }
                        element[casedAttribute] = value;
                    }
                }
            }
        }
    }
});
