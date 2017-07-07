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
    * We do the event attachment programatically to avoid
    * adding DOM handlers when no actions are provided.
    */
    EVENT_DISPATCH: {
        'keydown'   : 'onkeydown',
        'mouseover' : 'onmouseover',
        'mouseout'  : 'onmouseout',
        'focus'     : 'onfocus',
        'blur'      : 'onblur',
        'press'     : 'onclick'
    },

    /*
    * List of valid button types
    */
    VALID_BUTTON_TYPES: ['submit', 'button', 'reset'],
    /*

    /*
     * In order to not attach all declared dom handlers automatically, we just
     * attach the ones that have an action to be dispatched
    */
    initializeHandlers: function (cmp) {
        var htmlButton = cmp.find('button');
        var htmlAttr   = htmlButton.get('v.HTMLAttributes');
        var dispatcher = cmp.getConcreteComponent().getEventDispatcher();

        for (var e in this.EVENT_DISPATCH) {
            if (dispatcher[e] && dispatcher[e]["bubble"] && dispatcher[e]["bubble"].length) {
                htmlAttr[this.EVENT_DISPATCH[e]] = cmp.getReference('c.' + e);
            }
        }
    },

    /*
    * Check and replace button type if it is invalid
    */
    validateButtonType: function(cmp) {
        var buttonType = cmp.get("v.buttonType");
        if(this.VALID_BUTTON_TYPES.indexOf(buttonType.toLowerCase()) === -1) {
            //Revert to default browser button type if v.buttonType is invalid
            cmp.set("v.buttonType", "submit");
        }
    },

    /*
    * See initializeHandlers comments, then:
    * In order to add handlers dynamically, we need to override the original function.
    * We need to programatically add the aura handler and the DOM event.
    */
    addHandler: function (cmp, handlerParams) {
        var eventName = handlerParams.eventName;
        var htmlEventName = this.EVENT_DISPATCH[eventName];
        $A.assert(htmlEventName, 'Type of event not supported');

        var valueProvider = handlerParams.valueProvider;
        var actionExpression = handlerParams.actionExpression;
        var uiButton = cmp;
        while (!(uiButton.getDef().getDescriptor().getQualifiedName() === "markup://ui:button")) {
            uiButton = uiButton.getSuper();
        }
        var htmlButton = uiButton.find('button');
        var originalAddHandler = htmlButton.addHandler;
        var htmlAttr = htmlButton.get('v.HTMLAttributes');

        // Set the attribute so the aura:html will add the dom handler
        htmlAttr[htmlEventName] = cmp.getReference('c.' + eventName);
        // Set the attribute back so if the button is render will attach the handlers correctly
        htmlButton.set('v.HTMLAttributes', htmlAttr);

        // Call the origin addHandler method  with the given attributes
        originalAddHandler.call(cmp, eventName, valueProvider, actionExpression);

    },
    catchAndFireEvent: function (cmp, event, eventName) {
        if (eventName === 'press' && $A.util.getBooleanValue(cmp.get("v.stopPropagation"))) {
            $A.util.squash(event);
        }

        if ($A.util.getBooleanValue(cmp.get("v.disabled"))) {
            return event.preventDefault();
        }

        cmp.getEvent(eventName).fire({"domEvent": event});
    }
})// eslint-disable-line semi
