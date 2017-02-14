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
    canScroll : function (el) {
        var canScrollY = el.scrollHeight > el.offsetHeight;
        var canScrollX = el.scrollWidth > el.offsetWidth;
        return canScrollY || canScrollX;
    },
    isElementThatScrollAlways : function (target) {
        var isInputRange = target.tagName === 'INPUT' && target.type === 'range';
        return isInputRange;
    },
    isElementWithNativeScroll : function (target) {
        var isTextarea = target.tagName === 'TEXTAREA';
        return isTextarea;
    },
    isAtTop : function (el) {
        return el.scrollTop === 0;
    },
    isAtBottom : function (el) {
        return el.scrollHeight - el.scrollTop === el.offsetHeight
                || el.scrollHeight - el.scrollTop === el.clientHeight;
    },
    skipUIScroller : function (event) {
        event.cancelScrolling = true;
        event.preventBounce = false;
    },
    enableUIScroller : function (event) {
        event.cancelScrolling = false;
        event.preventBounce = true;
    },
    getWrapperElement : function(cmp) {
        return cmp.find("scrollerWrapper").getElement();
    },
    handleScrollTo : function (cmp, event) {
        var params = event.getParam('arguments'),
            dest    = params.destination,
            x       = params.xcoord || 0,
            y       = params.ycoord || 0;

        if (dest) {            
            var wrapper = this.getWrapperElement(cmp);

            dest = dest.toLowerCase();
            if (dest === 'custom') {
                wrapper.scrollTop  = Math.abs(y);
                wrapper.scrollLeft = Math.abs(x);
            } else if (dest === 'top') {
                wrapper.scrollTop = 0;
            } else if (dest === 'left') {
                wrapper.scrollLeft = 0;
            } else if (dest === 'bottom') {
                wrapper.scrollTop = wrapper.scrollHeight - wrapper.clientHeight;
            } else if (dest === 'right') {
                wrapper.scrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
            }
        }
    },
    updateStyle : function (cmp) {
        var height = cmp.get("v.height");
        var width = cmp.get("v.width");

        var styleDeclarations = [];

        if (height) {
            styleDeclarations.push('height:' + height);
        }

        if (width) {
            styleDeclarations.push('width:' + width);
        }

        cmp.set("v.privateWrapperStyle", styleDeclarations.join(';'));
    }
}) // eslint-disable-line semi
