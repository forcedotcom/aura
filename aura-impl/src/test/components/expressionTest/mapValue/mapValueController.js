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
    onValueChange : function(cmp, evt, helper){
        cmp._log || (cmp._log = []);
        cmp._log.push(evt.getParams());
    },

    onTriggerChange : function(cmp, evt, helper) {
    	var triggerCount = cmp.get("v.triggers.triggerCount");
    	cmp.set("v.triggers.triggerCount", (triggerCount || 0) + 1);

    	cmp._lastTriggerCount = (cmp._lastTriggerCount || 0) + 1;
    },

    onTrigger2Change : function(cmp, evt, helper) {
    	cmp._lastTrigger2Count = (cmp._lastTrigger2Count || 0) + 1;
    },

    noop : function(cmp, evt, helper) {
    	cmp._noopCount = (cmp._noopCount || 0) + 1;
    }
})
