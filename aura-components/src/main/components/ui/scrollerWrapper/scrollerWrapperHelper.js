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
    }

}) // eslint-disable-line semi
