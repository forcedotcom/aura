/*

    Copyright (C) 2013 salesforce.com, inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

 */
({
	openDialog : function(cmp, evt) {
		var openEvent = $A.get("e.ui:openDialog");
		openEvent.setParams({
			dialog : cmp.find("dialogBoxId"),
			triggerEvent : evt
		});
		openEvent.fire();
	},

	closeDialog : function(cmp, evt) {
		var value = evt.getParam("confirmClicked") ? "Data Submited" : "Data Not Submitted";
		cmp.find("resultLabel").set("v.value", value);
	}
})