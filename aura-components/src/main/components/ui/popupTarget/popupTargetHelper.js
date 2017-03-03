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
    /*
     * Grab all the associated HTML and aura components based on the concrete component
     * since we need to reference them multiple times in this helper. This provides that we
     * only query for the components once, instead of each time a method is called.
     */
    getElementCache: function (component) {
        var o;

        if (!component._localElementCache) {
            o = {};
            o.target = component.getConcreteComponent(); // the instance of popupTarget
            o.targetElement = o.target.getElement(); // the root html element

            if (component.find("popupTarget")) { // this prevents extended components from throwing an error because they don't contain this element
                o.targetDiv = component.find("popupTarget").getElement(); // the actual menu looking container that gets positioned relative to the trigger
            }

            o.triggerElement = component.getConcreteComponent().get("v.referenceElement");
            if (o.triggerElement) {
                o.trigger = this.getTriggerComponent(o.triggerElement);
            }
            component._localElementCache = o;
        }

        return component._localElementCache;
    },

    getTransitionEndEventName: function (component) {
        var el,
            names;

        if (!component._transitionEndEventName) {
            el = document.createElement('div');
            names = {
                'transition': 'transitionend',
                'OTransition': 'otransitionend',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };

            for (var i in names) {
                if (names.hasOwnProperty(i) && typeof el.style[i] !== 'undefined') {
                    component._transitionEndEventName = names[i];
                }
            }
        }

        return component._transitionEndEventName;
    },

    getTriggerComponent: function (element) {
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        var component = htmlCmp.getComponentValueProvider().getConcreteComponent();
        while (component && !component.isInstanceOf("ui:popupTrigger")) {
            component = component.getComponentValueProvider().getConcreteComponent();
        }
        return component;
    },

    position: function (component) {
        var attachToBody = component.get("v.attachToBody");

        if (attachToBody === true) {
            return this.positionAsBodyChild(component);
        } else {
            var element = component.find("popupTarget").getElement();
            element.classList.remove("positioned");
            window.requestAnimationFrame($A.getCallback(function () {
                if (!component.isValid()) {
                    return;
                }
                if (!component.get("v.manualPosition")) {
                    var elemRect = element.getBoundingClientRect();
                    var viewPort = $A.util.getWindowSize();

                    if (component.get("v.autoPosition") && elemRect.bottom > viewPort.height && elemRect.height) {
                        // not enough space below, position above
                        // note that this has issues with very tall popups, it would place them entirely out of view,
                        // with only the bottom of the popup visible, we should be limiting it so that it never goes
                        // outside of the viewport instead.

                        element.style.top = 0 - elemRect.height + "px";
                    }
                }
                element.classList.add("positioned");
            }));
        }
    },

    _getScrollableParent: function (elem) {
        if (this._scrollableParent) {
            return this._scrollableParent;
        }

        // if overflow is auto overflow-y is also auto,
        // however in firefox the opposite is not true
        var overflow = getComputedStyle(elem)['overflow-y'];

        if (overflow === 'auto') {
            this._scrollableParent = elem;
            return elem;
        }

        if (elem === document.body) {
            this._scrollableParent = null;
            return null;
        }

        return this._getScrollableParent(elem.parentNode);

    },

    positionAsBodyChild: function (component) {
        var element = component.find("popupTarget").getElement();
        var target = component.get("v.referenceElement");
        if (target && element) {
            var manualPosition = component.get("v.manualPosition");

            $A.util.attachToDocumentBody(component.getElement());

            if (manualPosition) {
                element.classList.add("positioned");
            } else {
                element.classList.remove("positioned");
                // make sure reposition happens outside the render cycle,
                // and that the panel is not visible until it is in position.
                window.requestAnimationFrame($A.getCallback(function () {
                    if (!component.isValid()) {
                        return;
                    }
                    element.style.opacity = 0;
                    var viewPort = $A.util.getWindowSize();
                    var elemRect = element.getBoundingClientRect();
                    var referenceElemRect = target.getBoundingClientRect();
                    var horizontalCornerAlignment = this.rightCornerFitsInViewport(viewPort, elemRect, referenceElemRect) ? "left" : "right";
                    var verticalCornerAlignment = this.bottomCornerFitsInViewport(viewPort, elemRect, referenceElemRect) ? "top" : "bottom";
                    component._constraint = this.lib.panelPositioning.createRelationship({
                        element: element,
                        target: target,
                        scrollableParentBound: true,
                        align: horizontalCornerAlignment + " " + verticalCornerAlignment,
                        targetAlign: horizontalCornerAlignment + " " + (verticalCornerAlignment === "top" ? "bottom" : "top"),
                        padTop: 2
                    });

                    this.lib.panelPositioning.reposition(function () {
                        element.classList.add("positioned");
                        element.style.opacity = 1;
                    });
                }.bind(this)));
            }
        }
    },

    unposition: function (component) {
        var element = component.find("popupTarget").getElement();
        element.classList.remove("positioned");
        if (component._constraint) {
            component._constraint.destroy();
            component._constraint = undefined;
        }
    },

    rightCornerFitsInViewport: function (viewPort, elemRect, referenceElemRect) {
        return (viewPort.width - referenceElemRect.left) > elemRect.width;

    },

    bottomCornerFitsInViewport: function (viewPort, elemRect, referenceElemRect) {
        return (viewPort.height - referenceElemRect.bottom) > elemRect.height;

    },

    setAriaAttributes: function (component) {
        var elements = this.getElementCache(component);

        if (elements.triggerElement && elements.target) {
            elements.targetElement.setAttribute("aria-labelledby", elements.trigger.getGlobalId());
        }
    },

    /*
     * Fires public events when menu expands or collapses
     */
    onVisibleChange: function (component) {
        var elements = this.getElementCache(component),
            visible = elements.target.get("v.visible"),
            transitionEndEventName = this.getTransitionEndEventName(component),
            hideFunc;

        if (elements.target.get('v.closeOnClickOutside') || elements.target.get('v.closeOnClickInside')) {
            if (visible === true) {
                this.addDismissEvents(component);
            } else {
                this.removeDismissEvents(component);
            }
        }

        // this function is called when css transitions are completed on target
        // it is stored in a variable since $A.util.removeOn requires that you pass the attached function as 3rd param
        hideFunc = function () {
            $A.util.addClass(elements.targetElement, component.get('v.preTransitionClass'));
            $A.util.removeOn(elements.targetElement, transitionEndEventName, hideFunc);
        };

        // setTimeout is so we can wait for the next life cycle to apply visible classes
        // or else CSS transitions will not work when the target is appended to the body
        // at the same time the visible property is changed
        setTimeout(function () {
            if (!elements.target.isValid()) {
                return;
            }
            if (visible === true) {
                $A.util.removeClass(elements.targetElement, component.get('v.preTransitionClass'));
                $A.util.addClass(elements.targetElement, "visible");
                elements.target.get("e.popupExpand").fire();
            } else {
                $A.util.on(elements.targetElement, transitionEndEventName, hideFunc, false);
                $A.util.removeClass(elements.targetElement, "visible");
                elements.target.get("e.popupCollapse").fire();
            }
        }, 0);
    },

    getOnClickEventProp: function (prop) {
        var cached;

        // create the cache
        if ($A.util.isUndefined(this.getOnClickEventProp.cache)) {
            this.getOnClickEventProp.cache = {};
        }

        // check the cache
        cached = this.getOnClickEventProp.cache[prop];

        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        // fill the cache
        this.getOnClickEventProp.cache["onClickStartEvent"] = "mousedown";
        this.getOnClickEventProp.cache["onClickEndEvent"] = "mouseup";

        return this.getOnClickEventProp.cache[prop];
    },

    getOnClickStartFunction: function (component) {
        var func;

        if ($A.util.isUndefined(component._onClickStartFunc)) {
            func = function (event) {
                component._onStartX = event.clientX;
                component._onStartY = event.clientY;
            };

            component._onClickStartFunc = func;
        }

        return component._onClickStartFunc;
    },

    getOnClickEndFunction: function (component) {
        var helper,
            func;

        if ($A.util.isUndefined(component._onClickEndFunc)) {
            helper = this;
            func = function (event) {
                // ignore gestures/swipes; only run the click handler if it's a click or tap
                var elements = helper.getElementCache(component),
                    doIf = {
                        clickIsInsideTarget: helper.isElementInComponent(elements.target, event.target),
                        clickIsInsideTrigger: helper.isElementInComponent(elements.trigger, event.target),
                        closeOnClickInside: component.get('v.closeOnClickInside'),
                        closeOnClickOutside: component.get('v.closeOnClickOutside'),
                        clickIsInCurtain: $A.util.hasClass(event.target, 'popupCurtain')
                    };

                if (
                    (doIf.clickIsInsideTarget && doIf.closeOnClickInside) // if click is in target and v.closeonclickinside is true
                    || (!doIf.clickIsInsideTarget && doIf.closeOnClickOutside && !doIf.clickIsInsideTrigger) // if click is out of target and out of trigger and v.closeOnClickOutside is true
                    || doIf.clickIsInCurtain // or if the user is clicking the curtain
                ) {
                    component.getConcreteComponent().get("e.doClose").fire();
                }
            };

            component._onClickEndFunc = func;
        }

        return component._onClickEndFunc;
    },

    getWindowBlurHandler: function (component) {
        if ($A.util.isUndefined(component._windowBlurHandlerFunc)) {
            var elements = this.getElementCache(component);

            component._windowBlurHandlerFunc = function () {
                elements.target.set("v.visible", !elements.target.get("v.visible"));
            };
        }

        return component._windowBlurHandlerFunc;
    },

    getWindowResizeHandler: function (component) {
        if ($A.util.isUndefined(component._windowResizeHandlerFunc)) {
            component._windowResizeHandlerFunc = function () {
                component.getDef().getHelper().position(component);
            };
        }

        return component._windowResizeHandlerFunc;
    },

    isElementInComponent: function (component, targetElem) {
        var currentNode = targetElem,
            componentElements;

        if (!component || !targetElem) {
            return false;
        }

        componentElements = component.getElements();

        // while currentNode is not false, climb the component tree
        // to see if we find a component with the same name as the 
        // parent component passed in as a parameter
        do {
            for (var i = 0, l = componentElements.length; i < l; i++) {
                if (componentElements[i] === currentNode) {
                    return true;
                }
            }

            // keep going until there are no more parentNodes
            currentNode = currentNode.parentNode;
        } while (currentNode);

        return false;
    },

    addDismissEvents: function (component) {
        $A.util.on(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
        $A.util.on(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));
        // window blur event is to hide/show menu when clicking on an iframe (as events do not bubble up and out of an iframe)
        $A.util.on(window, "blur", this.getWindowBlurHandler(component));
        // adding resize handler only when menuList is attached to the body
        if (this.getElementCache(component).target.get("v.attachToBody")) {
            $A.util.on(window, "resize", this.getWindowResizeHandler(component));
        }
    },

    removeDismissEvents: function (component) {
        $A.util.removeOn(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
        $A.util.removeOn(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));
        $A.util.removeOn(window, "blur", this.getWindowBlurHandler(component));
        $A.util.removeOn(window, "resize", this.getWindowResizeHandler(component));
    },

    /*
     * This method is here for components that extend this one to hook into keyboard events
     */
    handleKeyboardEvent: function () {
    }
})// eslint-disable-line semi
