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
    setActive: function (cmp, active, focus) {
        cmp.set("v.active", active);

        if (active) {
            var itemEl = this.getTabItemElement(cmp);
            if (itemEl && focus) {
                itemEl.focus();
            }
        }
    },

    getTabItemElement: function (cmp) {
        var p = cmp;
        var id = "tabItem";
        var container = cmp.find(id);
        while (!container && p.isInstanceOf("ui:tabItem")) {
            p = p.getSuper();
            container = p.find(id);
        }
        return container ? container.getElement() : null;
    },

    handleHoverEvent: function (cmp, eventName) {
        var event = cmp.getEvent(eventName);
        // Set this tabItem component as a param in the event
        var params = {
            tabComponent: cmp
        };
        event.setParams(params);
        event.fire();
    },

    initWidth: function (cmp) {
        var el = cmp.getElement();
        var style = window.getComputedStyle(el, '');
        var width = parseFloat(style.marginLeft) + parseFloat(style.marginRight) + el.offsetWidth;
        $A.util.setDataAttribute(el, "original-width", width);
    }
})// eslint-disable-line semi
