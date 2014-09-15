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
	updateTriggerLabel: function(cmp, event, helper) {
		helper.handleUpdateTriggerLabel(cmp, event, helper,"trigger");
	},
	clickPress: function(cmp, event, helper) {
		cmp.set('v.eventBubbled', true);
		cmp.find("outputStatus").set("v.value", "Event propogated to parent Div");
	},
	updateTriggerLabelForAttachToBody: function(cmp, event, helper) {
		helper.handleUpdateTriggerLabel(cmp, event, helper,"triggerAttachToBody");
	},
	toggle: function(cmp) {
        cmp.set('v.stopClickPropagation', !cmp.get('v.stopClickPropagation'));
        if(cmp.get('v.stopClickPropagation')){
        	cmp.find("outputStatus").set("v.value", "Event did not get propogated to parent Div");
        }
    }
})
