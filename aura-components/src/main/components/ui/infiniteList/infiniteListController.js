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
    init: function(component) {
        var dataProvider = component.get("v.dataProvider[0]");
        if(dataProvider && dataProvider.getModel()) {
            component.set("v.items", dataProvider.get("m.items"));
        }
    },

	showMore: function(component, event, helper) {
        $A.mark("infiniteList showMore " + component.getGlobalId());

		var params = event.getParams(),
			currentPageValue = component.get("v.currentPage"),
			currentPage = parseInt(currentPageValue, 10),
			targetPage = currentPage + 1;

        component.set("v.currentPage", targetPage, true);

        if (params.parameters && params.parameters.callback) {
        	component._callback = params.parameters.callback;
        }

        helper.triggerDataProvider(component.getSuper());
	},

	rerenderComplete: function(component, event, helper) {
        $A.endMark("infiniteList showMore " + component.getGlobalId());

		helper.showLoading(component, false);
        component.getEvent("rerenderComplete").fire();
	}
})
