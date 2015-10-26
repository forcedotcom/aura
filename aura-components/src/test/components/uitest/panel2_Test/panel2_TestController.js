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
	createPanel : function(cmp, event, helper) {
		cmp = cmp.find("tester");
		var type = cmp.get("v.panelType");
		var config = {};
		
		// set attributes for specific types of panels
		if (type == "panel") {
			config["direction"] = cmp.get("v.direction");
			config["referenceElementSelector"] = ".appInput";
		}

		// set panel's body
		var panelBody;
		panelBody = $A.createComponentFromConfig({
			componentDef : { descriptor: "markup://ui:outputText"},
			attributes : {
				values : {
					value : "Body of panel created by clicking on app input"
				}
			}
		});

		config["body"] = panelBody;

		// create panel
		$A.get("e.ui:createPanel").setParams(
				{
					panelType : type,
					visible : cmp.get("v.isVisible"),
					panelConfig : config,

					onCreate : function(panel) {
						cmp._panel = panel;
						cmp.find("idCreated").set("v.value", panel.getGlobalId());
						
						// setting idRefId if panel has referenceElement set
						if (panel.isInstanceOf("ui:panel")) {
							var refElIds = "";
							var refEl = panel.get("v.referenceElement");	
							
							if (!$A.util.isUndefinedOrNull(refEl)) {
								for (var i = 0; i < refEl.length; i++) {
									refElIds += refEl[i].id + ",";
								}
							}
							cmp.find("idRefEl").set("v.value", refElIds);
						}
					},

					onDestroy : function(panelId) {
						cmp.find("idDestroyed").set("v.value", panelId);
					}
				}).fire();
	}

})