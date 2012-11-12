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
    SPECIAL_BOOLEANS : ["checked",
                        "selected",
                        "disabled",
                        "readonly",
                        "multiple",
                        "ismap",
                        "defer",
                        "declare",
                        "noresize",
                        "nowrap",
                        "noshade",
                        "compact",
                        "autocomplete",
                        "required"],

    SPECIAL_CASINGS : function() {
        if (this.cachedCasings) {
            return this.cachedCasings;
        } else {
            return this.cachedCasings = (function() {
                var ret = {};
                var caseSensitiveAttributes = ["readOnly",
                                               "colSpan",
                                               "rowSpan",
                                               "bgColor",
                                               "tabIndex",
                                               "useMap",
                                               "accessKey",
                                               "maxLength"
                                               ];
                var attr;
                for (var i=0, len=caseSensitiveAttributes.length; i<len; i++) {
                    attr = caseSensitiveAttributes[i];
                    ret[attr.toLowerCase()] = attr;
                }

                ret["for"] = "htmlFor";
                ret["class"] = "className";

                return ret;
            }());
        }
    },

    // "void elements" as per http://dev.w3.org/html5/markup/syntax.html#syntax-elements
    BODYLESS_TAGS : {
        "area" : true,
        "base" : true,
        "br" : true,
        "col" : true,
        "command" : true,
        "embed" : true,
        "hr" : true,
        "img" : true,
        "input" : true,
        "keygen" : true,
        "link" : true,
        "meta" : true,
        "param" : true,
        "source" : true,
        "track" : true,
        "wbr" : true
    },

    caseAttribute : function(attribute) {
        return this.SPECIAL_CASINGS()[attribute.toLowerCase()] !== undefined ? this.SPECIAL_CASINGS()[attribute.toLowerCase()] : attribute.toLowerCase();
    },

    createFastClickHandler : function(element, handler) {
        var self = this;
        if (this.supportsTouchEvents()) {
            this.initFastClick();

            // Add "fast click" support for touch enabled devices to avoid 300ms browser lag while it figures out if its a gesture or a click
            var FastClick = self.FastClick;
            var fc = new FastClick(element, handler);
        } else {
            $A.util.on(element, "click", handler);
        }
    },

    supportsTouchEvents : function () {
        // cache the result--it's not going to change
        return this.supportsTouchEvents.cache || (this.supportsTouchEvents.cache = !$A.util.isUndefined(document.ontouchstart) && $A.getContext().getMode() !== 'PTEST' && $A.getContext().getMode() !== 'CADENCE');
    },

    initFastClick : function() {
        var self = this;
        if (!self.FastClick) {
            self.FastClick = function(element, handler) {
                this.element = element;
                this.handler = handler;

                element.addEventListener("touchstart", this, false);
            };

            self.FastClick.prototype.handleEvent = function(event) {
                switch (event.type) {
                case "touchstart":
                    this.onTouchStart(event);
                    break;
                case "touchmove":
                    this.onTouchMove(event);
                    break;
                case "touchend":
                    this.onClick(event);
                    break;
                }
            };

            self.FastClick.prototype.onTouchStart = function(event) {
                $A.util.on(this.element, "touchend", this, false);
                $A.util.on(document.body, "touchmove", this, false);

                this.startX = event.touches[0].clientX;
                this.startY = event.touches[0].clientY;
            };

            self.FastClick.prototype.onTouchMove = function(event) {
                if (Math.abs(event.touches[0].clientX - this.startX) > 4
                        || Math.abs(event.touches[0].clientY - this.startY) > 4) {
                    this.reset();
                }
            };

            self.FastClick.prototype.onClick = function(event) {
                event.stopPropagation();
                event.preventDefault();
                this.element.focus();
                this.handler(event);

                if (event.type == "touchend") {
                    self.FastClick.preventGhostClick(this.startX,
                            this.startY);
                }

                this.reset();
            };

            self.FastClick.prototype.reset = function() {
                this.element.removeEventListener("touchend", this, false);
                document.body.removeEventListener("touchmove", this, false);

                this.startX = 0;
                this.startY = 0;
            };

            self.FastClick.preventGhostClick = function(x, y) {
                self.FastClick.clickbusterCoordinates.push(x, y);
                window.setTimeout(self.FastClick.pop, 2500);
            };

            self.FastClick.pop = function() {
                self.FastClick.clickbusterCoordinates.splice(0, 2);
            };

            var onClickBuster = function(event) {
                for ( var i = 0; i < self.FastClick.clickbusterCoordinates.length; i += 2) {
                    var x = self.FastClick.clickbusterCoordinates[i];
                    var y = self.FastClick.clickbusterCoordinates[i + 1];
                    if (Math.abs(event.clientX - x) < 25
                            && Math.abs(event.clientY - y) < 25) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            };

            self.FastClick.clickbusterCoordinates = [];
            $A.util.on(document, "click", onClickBuster, true);

            // Need this otherwise the browser eats the event
            $A.util.on(document, "touchmove", function (e) { e.preventDefault(); }, false);
        }
    },

    domEventHandler : function (event) {
        var eventName = "on" + event.type;
        if (eventName === "ontouchend") {
            // Map from touch event to onclick
            eventName = "onclick";
        }

        var element = event.currentTarget;
        var ownerComponent = $A.componentService.getRenderingComponentForElement(element);
        var attributes = ownerComponent.getAttributes();
        var valueProvider = attributes.getValueProvider();
        var valueExpression = attributes.getValue("HTMLAttributes").getValue(eventName);

        $A.services.event.startFiring(eventName);

        var action = $A.expressionService.get(valueProvider, valueExpression);
        action.run(event);

        $A.services.event.finishFiring(eventName);
    },

    canHaveBody : function(component) {
        var tag = component.get("v.tag");
        return !this.BODYLESS_TAGS[tag.toLowerCase()];
    },

    createHtmlAttribute: function(name, ve, config) {
        var ret = config.ret;
        var component = config.component;
        var attributes = component.getAttributes();
        var valueProvider = attributes.getValueProvider();
        var on = $A.util.on;

        var value;
        // special handling if the attribute is an inline event handler
        if (name.toLowerCase().indexOf("on") === 0) {
            var eventName = name.substring(2);

            if (eventName.toLowerCase() === "click") {
                this.createFastClickHandler(ret, this.domEventHandler);
            } else {
                on(ret, eventName, this.domEventHandler);
            }
        } else {
            // ve is either an expression (and needs to be evaluated by
            // the expressionService), or a literal
            if (ve.isExpression()) {
                value = $A.expressionService.getValue(valueProvider, ve);

                // get the actual value from the Value object (if it's not null)
                if (value && value.auraType === "Value") {
                    if (aura.util.arrayIndexOf(this.SPECIAL_BOOLEANS, name.toLowerCase()) > -1) {
                        // TODO: values should someday know their type and do the right thing with getValue()
                        value = value.getBooleanValue();
                    } else {
                        value = value.getValue();
                    }
                }
            } else {
                value = ve.getValue();
            }

            var isHash = value && value.indexOf && value.indexOf("#") === 0;
            if (name.toLowerCase() === "href" && ret.tagName && ret.tagName.toLowerCase() === "a" && value && (isHash || this.supportsTouchEvents())) {
                this.createFastClickHandler(ret, function() {
                    if (isHash) {
                        $A.services.event.startFiring("click");
                        $A.historyService.set(value.substring(1));
                        $A.services.event.finishFiring("click");
                    } else {
                        // Make sure that non-hash style hrefs work fine even when fast clicking is engaged
                        var HTMLAttributes = component.getValue("v.HTMLAttributes");
                        var target = HTMLAttributes.getValue("target");
                        if (target) {
                            if (target.isExpression()) {
                                target = $A.expressionService.getValue(valueProvider, target);
                            }
                            target = target.unwrap();
                        }
                        window.open(value, target ? target : "_self");
                    }
                });

                var href = "javascript:void(0";
                if ($A.getContext().getMode() !== "PROD") {
                    // for testing we need to be able to easily identify
                    // links from their hrefs
                    href += "/*" + value + "*/";
                }
                href += ");";

                ret.setAttribute("href", href);
            } else if (name.toLowerCase() === "role" || name.lastIndexOf("aria-", 0) === 0) {
                // use setAttribute to render accessibility attributes to markup
                ret.setAttribute(name, value);
            } else if (aura.util.arrayIndexOf(this.SPECIAL_BOOLEANS,name.toLowerCase()) > -1) {
                // handle the boolean attributes for whom presence implies truth
                if (value === false) {
                    ret.removeAttribute(this.caseAttribute(name));
                } else {
                    ret.setAttribute(this.caseAttribute(name), name);
                }
            } else {
                // as long as we have a valid value at this point, set
                // it as an attribute on the DOM node
                // IE renders null value as string "null" for input (text) element, we have to work around that.
                if (!aura.util.isUndefined(value) && !($A.util.isIE && this.isInputNullValue(ret.tagName, name, value))) {
                    var lowerName = name.toLowerCase();
                    if (lowerName === "type" || lowerName === "href" || lowerName === "style") { // special case we have to use "setAttribute"
                        ret.setAttribute(this.caseAttribute(name), value);
                    } else {
                        ret[this.caseAttribute(name)] = value;
                    }
                }
            }
        }
    },
    
    isInputNullValue: function(tagName, attributeName, value) {
        if (tagName && attributeName) {
            return tagName.toLowerCase() === "input" && attributeName.toLowerCase() === "value" && value === null;
        }
        return false;
    }
})
