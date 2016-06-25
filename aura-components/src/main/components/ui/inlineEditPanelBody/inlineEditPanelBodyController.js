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
	init : function(cmp) {
	    var submitOn = cmp.get("v.submitOn");
		var inputComponent = cmp.get("v.inputComponent")[0];
		
		if (inputComponent && inputComponent.isInstanceOf("ui:input")) {
		    var submitAction = (submitOn === 'keydown') ? "c.keydown" : "c.submitValues";
			inputComponent.addHandler(submitOn, cmp, submitAction);
		}
	},
	
	keydown : function(cmp, evt, helper) {
	    var params = evt.getParams();
		// Assume ENTER key
		if (params.keyCode === 13 && !params.shiftKey && !params.ctrlKey) {
			helper.submit(cmp);
		}
	},
	
	submitValues : function(cmp, evt, helper) {
	    helper.submit(cmp);
	}
})// eslint-disable-line semi