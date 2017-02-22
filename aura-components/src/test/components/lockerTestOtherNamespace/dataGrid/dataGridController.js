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
	init: function(cmp) {
		var concrete = cmp.getConcreteComponent();
		//When lockerService is enabled, cmp will be a secure component, not the acutal component.
        concrete._lastCall = "init";
	},

    handleRefresh: function(cmp, param) {
        var concrete = cmp.getConcreteComponent();
        concrete._lastCall = "refreshInController"
    },

    getLastCall: function(cmp) {
        var concrete = cmp.getConcreteComponent();
        //If invoked with secure component, _lastCall will be set correctly, otherwise it will be undefined.
        concrete.set("v.lastCall", concrete._lastCall);
    }
})// eslint-disable-line semi