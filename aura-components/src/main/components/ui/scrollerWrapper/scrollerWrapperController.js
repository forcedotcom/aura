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
    handleTouchstart : function(cmp, event) {
        var startY = event.touches ? event.touches[0].screenY : event.screenY;
        cmp.set('v.privateStartY',startY);
    },
    handleTouchmove : function (cmp, event, helper) {
        var el     = event.currentTarget;
        var target = event.target;
        var startY = cmp.get('v.privateStartY');
        var canScrollCurrent, canScrollTarget;

        // if ui:scroller move action was canceled in a nested scrollerWrapper
        // don't do anything
        if (event.cancelScrolling) {
            return;
        }

        // There are elements that have their on scroll behavior
        // line <input type="range" />, those element never cause bouncing
        // or any container scroll
        if (helper.isElementThatScrollAlways(target)) {
            helper.skipUIScroller(event);
            return;
        }

        canScrollCurrent = helper.canScroll(el);
        // there are native element likes textarea that can scroll
        canScrollTarget  = helper.isElementWithNativeScroll(target) && helper.canScroll(target);

        if (canScrollTarget || canScrollCurrent) {
            el =  canScrollTarget && !event.preventBounce ? target : el;

            var curY = event.touches ? event.touches[0].screenY : event.screenY;

            // Determine if the user is trying to scroll past the top or bottom
            var isAtTop = (startY <= curY && el.scrollTop === 0);
            var isAtBottom = (startY >= curY && helper.isAtBottom(el));

            if (!isAtTop && !isAtBottom) {
                helper.skipUIScroller(event);
                return;
            }
            helper.enableUIScroller(event);
        }
    }
}) // eslint-disable-line semi