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
    focus: function(component, event, helper) {
    	component.getConcreteComponent().getDef().getHelper().focus(concreteCmp);
    },
    
    onClick : function(component, event, helper) {
    	if ($A.util.getBooleanValue(component.get("v.stopClickPropagation"))) {
            $A.util.squash(event, true);
        }
        helper.handleTriggerPress(component);
    },

    /*
     * popupToggle.evt is an event that custom trigger events can broadcast
     * which is caught by popup and responded to accordingly
     */
    onPopupToggle : function(component, event, helper) {
    	helper.handlePopupToggle(component, event);
    }
})