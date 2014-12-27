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
    // Test changed: cmp.getSuper().set("v.body", []) is no longer valid.
    // A containing component can set the v.body of any of it's children,
    // but should not be reconstructing its own definition at runtime.

	clearSimpleCmpBody : function(cmp, event, helper) {
		helper.clearCmpBody(cmp, 'simpleCmp');
	},
	setSimpleCmpBody : function(cmp, event, helper){
        helper.setCmpBody(cmp, 'simpleCmp');
	},
	addSimpleCmpBody : function(cmp, event, helper){
        helper.addCmpBody(cmp, 'simpleCmp');
	},
    clearCustomCmpBody : function(cmp, event, helper) {
        helper.clearCmpBody(cmp, 'customCmp');
    },
    setCustomCmpBody : function(cmp, event, helper){
        helper.setCmpBody(cmp, 'customCmp');
    },
    addCustomCmpBody : function(cmp, event, helper){
        helper.addCmpBody(cmp, 'customCmp');
    }
})