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
function lib() { //eslint-disable-line no-unused-vars
    // -- Utils
    function getElement(item) {
        var cmp = $A.util.isString(item) ? $A.getCmp(item) : $A.util.isComponent(item) ? item : null;
        item = item instanceof HTMLElement ? item : cmp && cmp.getElement();
        $A.assert(item, 'Invalid type of element to stack');
        return item;
    }

    function isPosAndHasZindex(el) {
        return el.style.zIndex !== 'auto' && !isNaN(parseInt(el.style.zIndex, 10));
    }

    function doesStyleCreateStackingCtx(el) {
        var styles = el.style;
        return  styles.opacity < 1 ||
                styles.transform !== 'none' ||
                styles.transformStyle === 'preserve-3d' ||
                styles.perspective !== 'none' ||
                styles.position === 'fixed' ||
                (styles.flowFrom !== 'none' && styles.content !== 'normal') || false;
    }

    function isStackingCtx(el) {
        return el.nodeType === 11 || el.tagName === 'HTML' || el._stackContextRoot || (isPosAndHasZindex(el) && doesStyleCreateStackingCtx(el));
    }

    function findElAncestor(el, ancestorEl, stackingCtxEl) {
        var parentNode = el.parentNode;
        if (stackingCtxEl === parentNode || parentNode.tagName === 'BODY') {
            return el;
        }
        
        while (parentNode.parentNode && parentNode.parentNode.tagName !== 'BODY') {
            parentNode = parentNode.parentNode;
        }

        return parentNode;
    }

    // -- Private internal methods
    function getStackingCtx(el) {
        var parentNode = el.parentNode;
        while (parentNode && !isStackingCtx(parentNode)) {
            parentNode = parentNode.parentNode;
        }
        return parentNode;
    }

    function modifyZindex(el, increment) {
        var stackingCtxEl = getStackingCtx(el);
        if (!stackingCtxEl) {
            return;
        }
        var siblings;
        var siblingsMaxMinZindex = increment ? 0 : -1;
        var elAncestor = el;
        var siblingZindex;
        var i = 0;

        stackingCtxEl = stackingCtxEl.tagName === 'HTML' ? document.getElementsByTagName('body')[0] : stackingCtxEl;
        siblings = stackingCtxEl.childNodes;
        if (stackingCtxEl !== el.parentNode) {
            for (i; i < siblings.length; i++) {
                elAncestor = findElAncestor(el, siblings[i], stackingCtxEl);
            }
        }

        for (i = 0; i < siblings.length; i++) {
            if (siblings[i].nodeType === 1 && isPosAndHasZindex(siblings[i]) && siblings[i] !== elAncestor) {
                siblingZindex = parseInt(siblings[i].style.zIndex, 10);
                if (isNaN(siblingZindex)) {
                    continue;
                }

                if (increment) {
                    siblingsMaxMinZindex = siblingZindex > siblingsMaxMinZindex ?
                        siblingZindex : siblingsMaxMinZindex;
                } else {
                    siblingsMaxMinZindex = siblingsMaxMinZindex < 0 || siblingZindex < siblingsMaxMinZindex ?
                        siblingZindex : siblingsMaxMinZindex;
                }
            }
        }

        // adjusted z-index is 0 and sending to back then bump all other elements up by 1
        if (!siblingsMaxMinZindex && !increment) {
            for (i = 0; i < siblings.length; i++) {
                if (siblings[i].nodeType === 1 && siblings[i] !== el) {
                    siblingZindex = parseInt(siblings[i].style.zIndex, 10);
                    if (isNaN(siblingZindex)) {
                        continue;
                    }

                    siblings[i].style.zIndex = ++siblingZindex;
                }
            }
        }

        elAncestor.style.zIndex = increment ? siblingsMaxMinZindex + 1 : (siblingsMaxMinZindex > 0 ? siblingsMaxMinZindex - 1 : 0);
    }

    function moveUpOrDown(el, forceCreateStackingCtx, increment) {
        var stackingCtxEl = getStackingCtx(el);
        if (forceCreateStackingCtx && stackingCtxEl !== el.parentNode) {
            if ($A.util.isFunction(forceCreateStackingCtx)) {
                forceCreateStackingCtx(el.parentNode);
            } else {
                el.parentNode.style.position = 'relative';
                el.parentNode.style.zIndex = 0;
            }
        }
        return modifyZindex(el, increment);
    }

    return {
        bringToFront: function (element, forceCreateStackingCtx) {
            element = getElement(element);
            return moveUpOrDown(element, forceCreateStackingCtx, true);
        },
        sendToBack: function (element, forceCreateStackingCtx) {
            element = getElement(element);
            return moveUpOrDown(element, forceCreateStackingCtx, false);
        },
        setStackingContextRoot: function (element) {
            element = getElement(element);
            element._stackContextRoot = true;
        }
    };
}
