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
    onClick: function(component, event, helper) {
        if (event && $A.util.getBooleanValue(component.get("v.stopClickPropagation"))) {
            $A.util.squash(event);
        }

        if (component._recentlyClicked) {
            return;
        }

        var concreteCmp = component.getConcreteComponent();
        var concreteHelper = concreteCmp.helper;
        concreteHelper.handleTriggerPress(concreteCmp);
        helper.fireMenuTriggerPress(component);

        if ($A.util.getBooleanValue(component.get("v.disableDoubleClicks"))) {
            component._recentlyClicked = true;
            window.setTimeout($A.getCallback(function() { component._recentlyClicked = false; }), 350);
        }
    },

    focus: function(component, event, helper) {
        var concreteCmp = component.getConcreteComponent();
        //var concreteHelper = concreteCmp.helper || concreteCmp.getDef().getHelper();
        var concreteHelper = concreteCmp.helper;
        if (concreteHelper.focus) {
        	concreteHelper.focus(concreteCmp);
        }
    }
})// eslint-disable-line semi