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

    // string constants used to save fast click event and handler
    NAMES: {
        "touchStart": "fcTouchStart",
        "touchEnd": "fcTouchEnd",
        "touchMove": "fcTouchMove",
        "domHandler": "fcDomHandler",
        "hashHandler": "fcHashHandler"
    },

    GESTURE: function (){
        var g;
        if (this.cachedGestures) {
            return this.cachedGestures;
        } else {

            if (window["navigator"]["pointerEnabled"]) {
                g = {
                        start : 'pointerdown',
                        move : 'pointermove',
                        end : 'pointerup' 
                    };

            } else if (window["navigator"]["msPointerEnabled"]) {
                g = {
                        start : 'MSPointerDown',
                        move : 'MSPointerMove',
                        end : 'MSPointerUp' 
                    };
                
            } else {
                g = {
                        start : 'touchstart',
                        move : 'touchmove',
                        end : 'touchend'
                    };
            }
            return this.cachedGestures = g;
        }
    },

    caseAttribute : function(attribute) {
        return this.SPECIAL_CASINGS()[attribute.toLowerCase()] !== undefined ? this.SPECIAL_CASINGS()[attribute.toLowerCase()] : attribute.toLowerCase();
    },

    /**
     * Sets up fast click handling
     *
     * @param element element to enable fast click checking on
     * @param handler handler for fast click event listener
     * @param name name of the type of handler
     * @returns {Function} previous handler if any
     */
    createFastClickHandler : function(element, handler, name) {
        // remove existing click event listeners if component is rerendered
        // there are potentially two handlers: one for domEvent and another for hashEvent
        // so we need to save reference and remove the right one
        var previousHandler = element[name];
        if($A.util.isFunction(previousHandler)) {
            $A.util.removeOn(element, "click", previousHandler);
        }

        if (this.supportsTouchEvents()) {
            // typically mobile and touch screens
            var FastClick = this.initFastClick();
            // remove the touch event listeners for the same two handlers
            var touchHandler = name + "Touch";
            var previousTouchHandler = element[touchHandler];
            if (!$A.util.isUndefinedOrNull(previousTouchHandler)) {
                $A.util.removeOn(element, element[this.NAMES.touchStart], previousTouchHandler);
                $A.util.removeOn(element, element[this.NAMES.touchMove], previousTouchHandler);
                $A.util.removeOn(element, element[this.NAMES.touchEnd], previousTouchHandler);
            }
            element[touchHandler] = new FastClick(element, handler);
        }

        // mouse click by default for devices with both touch and click capabilities
        $A.util.on(element, "click", handler);

        // save current handler on element so that it can be referenced and removed later
        element[name] = handler;
        return previousHandler;
    },

    supportsTouchEvents : function () {
        return $A.util.supportsTouchEvents();
    },

    initFastClick : function() {
        var gesture = this.GESTURE(),
            touchStart = this.NAMES.touchStart,
            touchMove = this.NAMES.touchMove,
            touchEnd = this.NAMES.touchEnd,
            FastClick;

        if (!this.FastClick) {
            /**
             * FastClick constructor
             *
             * @constructor
             * @param element element to enable fast click checking on
             * @param handler handler for fast click event listener
             **/
            FastClick = function(element, handler) {
                // save fast click event type in order to remove listener
                element[touchStart] = gesture.start;
                element[touchMove] = gesture.move;
                element[touchEnd] = gesture.end;
                this.element = element;
                this.handler = handler;
                element.addEventListener(gesture.start, this, false);
            };

            FastClick.prototype = {
                handleEvent : function (event) {
                    switch (event.type) {
                    case 'touchstart':
                    case 'pointerdown':
                    case 'MSPointerDown':
                        this.onTouchStart(event);
                        break;
                    case 'touchmove':
                    case 'pointermove':
                    case 'MSPointerMove':
                        this.onTouchMove(event);
                        break;
                    case 'touchend':
                    case 'pointerup':
                    case 'MSPointerUp':
                        this.onClick(event);
                        break;
                    }
                },
                onTouchStart : function(event) {
                    var point = event.touches ? event.touches[0] : event;
                    $A.util.on(this.element, gesture.end, this, false);
                    // Bind gesture.move event to this.element instead of document.body, for the event could be stop
                    // propagated by child elements
                    $A.util.on(this.element, gesture.move, this, false);
                    this.startX = point.pageX;
                    this.startY = point.pageY;
                },
                onTouchMove : function(event) {
                    var point = event.touches ? event.touches[0] : event;
                    var dragThresholdPixels = 4;
                    if (Math.abs(point.pageX - this.startX) > dragThresholdPixels
                        || Math.abs(point.pageY - this.startY) > dragThresholdPixels) {
                        this.reset();
                    }
                },
                onClick : function(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    this.element.focus();

                    this.handler(event);

                    if (event.type == gesture.end) {
                        FastClick.preventGhostClick(this.startX, this.startY);
                    }
                    this.reset();
                },
                reset : function() {
                    $A.util.removeOn(this.element, gesture.end, this, false);
                    // See comment in #onTouchStart regarding binding gesture.move to this.element instead of
                    // document.body
                    $A.util.removeOn(this.element, gesture.move, this, false);

                    this.startX = 0;
                    this.startY = 0;
                }
            };

            FastClick.preventGhostClick  = function(x, y) {
                FastClick.clickbusterCoordinates.push(x, y);
                window.setTimeout(FastClick.pop, 2500);
            };

            FastClick.pop = function() {
                FastClick.clickbusterCoordinates.splice(0, 2);
            };

            FastClick.onClickBuster = function(event) {
                var point = event.touches ? event.touches[0] : event,
                    i, x, y;
                for (i = 0; i < FastClick.clickbusterCoordinates.length; i += 2) {
                    x = FastClick.clickbusterCoordinates[i];
                    y = FastClick.clickbusterCoordinates[i + 1];
                    if (Math.abs(point.pageX - x) < 25 && Math.abs(point.pageY - y) < 25) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            };

            FastClick.clickbusterCoordinates = [];
            $A.util.on(document, "click", FastClick.onClickBuster, true);

            this.FastClick = FastClick;
        }

        return this.FastClick;
    },

    domEventHandler : function (event) {
        var eventName       = "on" + event.type,
            element         = event.currentTarget,
            ownerComponent  = $A.componentService.getRenderingComponentForElement(element),
            valueProvider   = ownerComponent.getAttributeValueProvider(),
            htmlAttributes  = ownerComponent.getValue("v.HTMLAttributes"),
            valueExpression = htmlAttributes.getValue(eventName),
            onclickExpression;

        if (eventName === 'ontouchend' || eventName === 'onpointerup' || eventName === 'onMSPointerUp') {
            // Validate that either onclick or ontouchend is wired up to an action never both simultaneously
        	 onclickExpression = htmlAttributes.getValue("onclick");
             if (onclickExpression.isDefined()) {
                 if (!valueExpression.isDefined()) {
                    // Map from touch event to onclick
                    valueExpression = onclickExpression;
                }
            }
        }

        $A.run(function () {
                var action = $A.expressionService.get(valueProvider, valueExpression);
                action.runDeprecated(event);
            })
    },

    canHaveBody : function(component) {
        var tag = component.get("v.tag");
        if ($A.util.isUndefinedOrNull(tag)) {
            $A.error("Undefined tag attribute for "+component.getGlobalId());
            return true;
        }
        return !this.BODYLESS_TAGS[tag.toLowerCase()];
    },

    createHtmlAttribute: function(name, ve, config) {
        var ret           = config.ret,
            component     = config.component,
            valueProvider = component.getAttributeValueProvider(),
            on            = $A.util.on,
            value;

        // special handling if the attribute is an inline event handler
        if (name.toLowerCase().indexOf("on") === 0) {
            var eventName = name.substring(2);

            if (eventName.toLowerCase() === "click") {
                this.createFastClickHandler(ret, this.domEventHandler, this.NAMES.domHandler);
            } else {
                on(ret, eventName, this.domEventHandler);
            }
        } else {
            // ve is either an expression (and needs to be evaluated by
            // the expressionService), or a literal
            if (ve && ve.isExpression) {
                if (ve.isExpression()) {
                    value = $A.expressionService.getValue(valueProvider, ve);

                    // get the actual value from the Value object (if it's not null)
                    if (value && value.auraType === "Value") {
                        if (aura.util.arrayIndexOf(this.SPECIAL_BOOLEANS, name.toLowerCase()) > -1) {
                            // TODO: values should someday know their type and do the right thing with getValue()
                            // JBUCH: FIXME TEMPORARY FIX FOR HALO
                            value = $A.util.getBooleanValue(value.getValue());
                        } else {
                            value = value.getValue();
                        }
                    }
                } else {
                    value = ve.getValue();
                }
            } else{
                value = ve;
            }

            var isHash = value && value.indexOf && value.indexOf("#") === 0;
            if (name.toLowerCase() === "href" && ret.tagName && ret.tagName.toLowerCase() === "a" && value && (isHash || this.supportsTouchEvents())) {
            	var HTMLAttributes = component.getValue("v.HTMLAttributes");
                var target = HTMLAttributes.getValue("target");
                if (target) {
                    if (target.isExpression()) {
                        target = $A.expressionService.getValue(valueProvider, target);
                    }
                    target = target.unwrap();
                }
                this.createFastClickHandler(ret, function() {
                    if (isHash) {
                        $A.run(function () { $A.historyService.set(value.substring(1)); })
                    } else {
                        // Make sure that non-hash style hrefs work fine even when fast clicking is engaged
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

                ret.setAttribute("href", href);
            } else if (name.toLowerCase() === "role" || name.lastIndexOf("aria-", 0) === 0) {
                // use setAttribute to render accessibility attributes to markup
                ret.setAttribute(name, value);
            } else if (aura.util.arrayIndexOf(this.SPECIAL_BOOLEANS, name.toLowerCase()) > -1) {
                // handle the boolean attributes for whom presence implies truth
                var casedName = this.caseAttribute(name);
                if (value === false) {
                    ret.removeAttribute(casedName);
                } else {
                    ret.setAttribute(casedName, name);

                    // Support for IE's weird handling of checked
                    if (casedName === "checked"){
                        ret.setAttribute("defaultChecked", true);
                    }
                }
            } else {
                // as long as we have a valid value at this point, set
                // it as an attribute on the DOM node
                // IE renders null value as string "null" for input (text) element, we have to work around that.
                if (!aura.util.isUndefined(value) && !($A.util.isIE && this.isInputNullValue(ret.tagName, name, value))) {
                    var casedAttribute = this.caseAttribute(name);
                    var lowerName = name.toLowerCase();
                    if (lowerName === "style" && $A.util.isIE) {
                        ret.style.cssText = value;
                    } else if (lowerName === "type" || lowerName === "href" || lowerName === "style" || lowerName.indexOf("data-") === 0) {
                        // special case we have to use "setAttribute"
                        ret.setAttribute(casedAttribute, value);
                    } else {
                        ret[casedAttribute] = value;
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
