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

function lib(focusUtil) { //eslint-disable-line no-unused-vars
    var STACK = [];

    /**
     * Pushes an element into the stack
     * @param {Element} element
     */
    function push(element) {
        STACK.push(element);
    }

    /**
     * Pops an {element, xpath} object from the stack.
     * @returns {Object}
     */
    function pop() {
        return STACK.pop();
    }

    function _getRealActiveElement() {
        var active = document.activeElement;
        while (active.shadowRoot) {
            active = active.shadowRoot.activeElement;
        }
        return active;
    }
    /**
     * Returns the current activeElement, if document's activeElement can be accessed.
     * @returns {Element | null}
     */
    function getActiveElement(cmp) {
        // Edge/IE11 throws an Unspecified Error for document.activeElement when accessed from an iframe.
        try {
            // IE11 use lastActive if it's specified.
            return (cmp && cmp.lastActive) || _getRealActiveElement();
        } catch(e) {
            return null;
        }
    }

    /**
     * Returns an element if the given selector is available in the DOM.
     * @param {String} selector
     * @returns {Element | null}
     */
    function getQuerySelector(selector) {
        try {
            return document.querySelector(selector);
        } catch(e) {
            return null;
        }
    }

    /**
     * Returns true if the component has focus.
     * @param {Component} component
     * @returns {boolean}
     */
    function hasFocus(component) {
        if (!component || !component.isValid()) {
            return false;
        }
        var active = getActiveElement(component);
        var i, el, els;
        if (active) {
            els = component.getElements();
            for (i=0; i < els.length; i++) {
                el = els[i];
                if (el === active || el.contains(active)) {
                    return true;
                }
            }
        }
        return false;
    }

    function sanitizeClassName(className) {       
        if (className) {
            var path = typeof className.trim === "function" ? className.trim() : $A.util.trim(className);
            return '.' + path.replace(/\s+/g, ".");
        } else {
            return "";
        }
    }

    /**
     * Generates selector for a given element.
     * @param {Element} element
     * @returns {String | undefined} selector
     */
    function generateSelector(element) {
        if (!(element instanceof Element)) {
            return undefined;
        }
        var selector = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            var path = element.nodeName.toLowerCase();
            var sibling = element, index = 1;
            while ((sibling = sibling.previousElementSibling)) {
                if (sibling.nodeName.toLowerCase() === path) {
                    index++;
                }
            }
            if (index !== 1) {
                path += ":nth-of-type("+index+")";
            }
            selector.unshift(path + sanitizeClassName(element.getAttribute('class')));
            element = element.parentNode;            
        }
        return selector.join(" > ");
    }

    /**
     * Pushes the given element or activeElement and its Selector into the stack.
     * @param {Element} [element] - Element to which the focus should return.
     */
    function stackFocus(element) {
        var elem = element || getActiveElement();
        if (elem && elem !== document.body) {
            var path = generateSelector(elem);
            var el = {
                domElement: elem,
                selector: path
            };
            push(el);
        }
    }

    /**
     * For a given component that has focus it pops the element, xPath.
     * @param {Component} component - Component from which this method is called.
     */
    function popFocus(component, forcePop) {
        // hasFocus() works as expected if it's modal. For panel, such as closeOnClickOut,
        // focus is already changed, so hasFocus will always return false.
        if (!forcePop && !hasFocus(component)) {
            return null;
        }

        var el = pop();
        while (el && (!document.body.contains(el.domElement) || focusUtil.isElementHidden(el.domElement))) {
            if(el.selector) {
                var element = getQuerySelector(el.selector);
                if(element && 
                    document.body.contains(element) && 
                    !focusUtil.isElementHidden(element)) {
                    el.domElement = element;
                    break;
                }
            }
            el = pop();
        }

        if ($A.util.isUndefinedOrNull(el)) {
            return null;
        }

        if(!getActiveElement()) {
            // last resort, make sure focus is in the document
            el.domElement = document.body;
        }
        return el.domElement;
    }    

    /**
     * For a given component that has focus it pops the element, xPath and
     * sets focus to it if its visible in the DOM.
     * @param {Component} component - Component from which this method is called.
     */
    function unstackFocus(component) {
        var domElement = popFocus(component);
        
        if (domElement && domElement.focus) {
            domElement.focus();
        } 
    }

    return {
        stackFocus   : stackFocus,
        unstackFocus : unstackFocus,
        popFocus : popFocus,
        getRealActiveElement: _getRealActiveElement
    };

}