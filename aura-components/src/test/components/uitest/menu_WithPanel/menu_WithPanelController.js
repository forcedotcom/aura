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
	openPanel : function(cmp) {
		var config = {};
		config["showColoseButton"] = true;
		config["body"] = "body of panel opened from ui:menu";

		// create panel
		$A.get("e.ui:createPanel").setParams({
			panelType : "modal",
			visible : true,
			panelConfig : config,
			onCreate : function(panel) {
				cmp._panel = panel;
			}
		}).fire();
	}
})