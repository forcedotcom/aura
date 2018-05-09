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

 // Code fom:
 // https://github.com/davidtheclark/tabbable
 // https://github.com/davidtheclark/focus-trap

function lib() { //eslint-disable-line no-unused-vars
    /**
     * Returns true if the given element "el" is not visible
     * @param {Element} el
     * @return {boolean}
     */
    function isElementHidden(el) {
        if (el === document.documentElement) {
            return false;
        }

        var result = false;
        var style = window.getComputedStyle(el) || el.style;
        if (style.visibility === 'hidden' || style.display === 'none') {
            result = true;
        } else if (el.parentNode) {
            result = isElementHidden(el.parentNode);
        }
        return result;
    }

    /**
     * Returns true if the given element "el" can accept focus via tab
     * @param {Element} el
     * @return {boolean}
     */
    function isTabbable(el) {
        if (el.tabIndex < 0 ||
            (el.tagName === 'INPUT' && el.type === 'hidden') ||
            (el.tagName === 'A' && !el.href && !el.tabIndex) ||
            el.disabled ||
            isElementHidden(el)) {
            return false;
        }
        return true;
    }

    /**
     * Returns an ordered array of all the tabbable descendant elements of the given element "el"
     * @param {Element} el
     * @return {array}
     */
    function getTabbableChildren(el) {
        var basicTabbables = [];
        var orderedTabbables = [];
        var candidateNodelist = el.querySelectorAll('input, select, a, textarea, button, [tabindex]');
        var candidates = Array.prototype.slice.call(candidateNodelist);
        var candidate, candidateIndex;

        for (var i = 0, l = candidates.length; i < l; i++) {
            candidate = candidates[i];
            candidateIndex = candidate.tabIndex;

            if (!isTabbable(candidate)) {
                continue;
            }

            if (candidateIndex === 0) {
                basicTabbables.push(candidate);
            } else {
                orderedTabbables.push({
                    tabIndex: candidateIndex,
                    node: candidate
                });
            }
        }

        var tabbableNodes = orderedTabbables
            .sort(function(a, b) {
                return a.tabIndex - b.tabIndex;
            })
            .map(function(a) {
                return a.node;
            });

        Array.prototype.push.apply(tabbableNodes, basicTabbables);
        return tabbableNodes;
    }

    /**
     * Assign focus to the next focusable element in the DOM after (or before) "el"
     * @param {Element} el
     * @param {boolean} forward true to move forward in the DOM, false to move backwards
     * @return {boolean} true if focus was set to another element
     */
    function focusNextTabbable(el, forward) {
        if (!el.parentNode || el.parentNode === document.documentElement) {
            return false;
        }

        // check siblings before walking up the dom
        var sib, tabbables, index;
        var sibs = Array.prototype.slice.call(el.parentNode.children);

        if (!forward) {
            sibs = sibs.reverse();
        }
        index = sibs.indexOf(el);

        for (var i = (index+1); i < sibs.length; i++) {
            sib = sibs[i];
            if (isTabbable(sib)) {
                sib.focus();
                return true;
            }
            tabbables = getTabbableChildren(sib);
            if (tabbables.length) {
                tabbables[forward ? 0 : (tabbables.length - 1)].focus();
                return true;
            }
        }

        // next level up the dom
        return focusNextTabbable(el.parentNode, forward);
    }

    return {
        getTabbableChildren : getTabbableChildren,
        isElementHidden     : isElementHidden,
        focusNextTabbable   : focusNextTabbable,
        isTabbable          : isTabbable
    };
}
