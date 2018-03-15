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
    EVENT_DISPATCH: {
        'onTabHover'   : ['onfocus', 'onmouseover'],
        'onTabUnhover' : ['onblur', 'onmouseout']
    },
    initializeHandlers: function (cmp) {
        var htmlItem   = cmp.find('tabItemAnchor');
        var htmlAttr   = htmlItem.get('v.HTMLAttributes');
        var dispatcher = cmp.getConcreteComponent().getEventDispatcher();

        for (var e in this.EVENT_DISPATCH) {
            if (dispatcher[e] && dispatcher[e]["bubble"] && dispatcher[e]["bubble"].length) {
                var events = this.EVENT_DISPATCH[e];
                for (var i in events) {
                    htmlAttr[events[i]] = cmp.getReference('c.' + e);
                }
            }
        }
    },
    /*
    * See initializeHandlers comments, then:
    * In order to add handlers dynamically, we need to override the original function.
    * We need to programatically add the aura handler and the DOM event.
    */
    addHandler: function (cmp, handlerParams) {
        var eventName = handlerParams.eventName;
        var htmlEventNames = this.EVENT_DISPATCH[eventName];
        $A.assert(htmlEventNames, 'Type of event not supported');

        var valueProvider = handlerParams.valueProvider;
        var actionExpression = handlerParams.actionExpression;

        var tmp = cmp;
        while (!(tmp.getDef().getDescriptor().getQualifiedName() === "markup://ui:tabItem")) {
            tmp = tmp.getSuper();
        }

        var htmlAnchor = tmp.find('tabItemAnchor');
        var originalAddHandler = htmlAnchor.addHandler;
        var htmlAttr = htmlAnchor.get('v.HTMLAttributes');

        for (var i in htmlEventNames) {
            htmlAttr[htmlEventNames[i]] = cmp.getReference('c.' + eventName);
        }
        // Set the attribute back so if the button is render will attach the handlers correctly
        htmlAnchor.set('v.HTMLAttributes', htmlAttr);

        // Call the origin addHandler method  with the given attributes
        originalAddHandler.call(cmp, eventName, valueProvider, actionExpression);

    },
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
        var id = 'tabItemAnchor';
        var container = cmp.find(id);
        while (!container && p.isInstanceOf("ui:tabItem")) {
            p = p.getSuper();
            container = p.find(id);
        }
        return container ? container.getElement() : null;
    },

    handleHoverEvent: function (cmp, eventName) {
        cmp.getEvent(eventName)
        .setParams({ tabComponent: cmp })
        .fire();
    },

    initWidth: function (cmp) {
        var el = cmp.getElement();
        // Firefox getComputedStyle could return null if element has display:none.
        var style = (el instanceof Element) ? window.getComputedStyle(el, '') : null;
        if (style) {
            var width = parseFloat(style.marginLeft) + parseFloat(style.marginRight) + el.offsetWidth;
            $A.util.setDataAttribute(el, "original-width", width);
        }
    }
})// eslint-disable-line semi
