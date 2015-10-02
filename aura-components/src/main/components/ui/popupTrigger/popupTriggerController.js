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
    focus: function(component) {
    	var concreteCmp = component.getConcreteComponent();
        //var _helper = concreteCmp.getDef().getHelper();
        var _helper = concreteCmp.helper;
        _helper.focus(concreteCmp);
    },

    onClick : function(component, event) {
        var concreteCmp = component.getConcreteComponent();
        //var _helper = concreteCmp.getDef().getHelper();
        var _helper = concreteCmp.helper;
        if ($A.util.getBooleanValue(concreteCmp.get("v.stopClickPropagation"))) {
            $A.util.squash(event.getParam("domEvent"), true);
        }
        _helper.handleClick(component, event);
    },

    // TODO: Refactor this trigger
    // 1. Add interface for trigger
    // 2. Dont call directly the helper method instead of proxyfy to onClick
    triggerInteraction: function (cmp) {
         cmp.get('c.onClick').run();
    },

    /*
     * popupToggle.evt is an event that custom trigger events can broadcast
     * which is caught by popup and responded to accordingly
     */
    onPopupToggle : function(component, event, helper) {
    	helper.handlePopupToggle(component, event);
    }
})// eslint-disable-line semi
