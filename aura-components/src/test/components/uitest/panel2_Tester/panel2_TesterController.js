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
	init : function(cmp, event, helper) {
		var opts = [{ "label": "Option1", "value": "Option1", "class": "option" },
		            { "label": "Option2", "value": "Option2", "class": "option", "selected": true },
		            { "label": "Option3", "value": "Option3", "class": "option" },
		            { "label": "Option4", "value": "Option4", "class": "option" }];
		
		cmp.find("inputSelectionOptions").set("v.options", opts);
		
		helper.createHeaderFooterInstance(cmp);
	},

	createPanel : function(cmp, event, helper) {
		var config = {};
		var type = cmp.get("v.panelType");
		var panelTitle = cmp.get("v.title")

		// set attributes for specific types of panels
		switch (type) {
			case "modal": {
				if (panelTitle !== "") {
					config["title"] = panelTitle + " -- Modal";
				}
				break;
			}
			case "panel": {
				if (panelTitle !== "") {
					config["title"] = cmp.get("v.title") + " -- Dialog";
				}
				config["direction"] = cmp.get("v.direction");
				config["showPointer"] = $A.util.getBooleanValue(cmp
						.get("v.showPointer"));
				config["referenceElementSelector"] = cmp
						.get("v.referenceElementSelector");
				config["classNames"] = cmp.get("v.classNames");
	
				var useReferenceElementSelector = $A.util.getBooleanValue(cmp.get("v.useReferenceElementSelector"));
				var referenceElementSelector = cmp.get("v.referenceElementSelector");
				if (useReferenceElementSelector && referenceElementSelector) {
					config["referenceElementSelector"] = referenceElementSelector;
				}
	
				var useReferenceElement = $A.util.getBooleanValue(cmp.get("v.useReferenceElement"));
				if (useReferenceElement) {
					var refEl = null;
					var referenceElementSelector = cmp.get("v.referenceElementSelector");
					if (referenceElementSelector != "null") {
						refEl = document.querySelectorAll(referenceElementSelector);
					} else if (referenceElementSelector == "empty") {
						refEl = [];
					}
					config["referenceElement"] = refEl;
				}
				break;
			}
		}

		// set common attributes for panel
		config["titleDisplay"] = $A.util.getBooleanValue(cmp
				.get("v.titleDisplay"));
		config["startOfDialogLabel"] = cmp.get("v.startOfDialogLabel");
		config["closeOnClickOut"] = $A.util.getBooleanValue(cmp
				.get("v.closeOnClickOut"));
		config["showCloseButton"] = $A.util.getBooleanValue(cmp
				.get("v.showCloseButton"));
		config["closeDialogLabel"] = cmp.get("v.closeDialogLabel");
		config["useTransition"] = $A.util.getBooleanValue(cmp
				.get("v.useTransition"));
		config["animation"] = cmp.get("v.animation");
		config["autoFocus"] = $A.util.getBooleanValue(cmp.get("v.autoFocus"));
		config["class"] = cmp.get("v.class");
		config["flavor"] = cmp.get("v.flavor");
		config["trapFocus"] = $A.util.getBooleanValue(cmp.get("v.trapFocus"));
		config["returnFocusElement"] = cmp.get("v.returnFocusElement");
		
		// provide an option not to destroy the panel when closeOnClickOut is
		// set to true.
		// Bug: W-2619406
		var CustomizeCloseAction = $A.util.getBooleanValue(cmp
				.get("v.customizeCloseAction"));
		if (CustomizeCloseAction) {
			config["closeAction"] = $A.getCallback(function(panel, reason) {
				cmp.set("v.closeActionCalled",
						"CloseActionCustomMethodCalled when " + reason);
            })
		}
		helper.createHeaderFooterInstance(cmp, true);

		var useHeader = $A.util.getBooleanValue(cmp.get("v.useHeader"));
		var panelHeader = cmp.get("v.panelHeader");
		if (useHeader && panelHeader.length > 0) {
			config["header"] = panelHeader;
		}

		var useFooter = $A.util.getBooleanValue(cmp.get("v.useFooter"));
		var panelFooter = cmp.get("v.panelFooter");
		if (useFooter && panelFooter.length > 0) {
			config["footer"] = panelFooter;
		}

		// set panel's body
		var makeScrollable = cmp.get("v.makeScrollable");
		var panelBody = [];
		if (makeScrollable) {
			// body of panel is just a bunch of text
			panelBody = $A
					.createComponentFromConfig({
						componentDef : {descriptor: "markup://ui:outputText"},
						attributes : {
							values : {
								value : "Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com Salesforce.com "
							}
						}
					});
		} else if (cmp.get("v.nonScrollable")) {
			// body of panel is just a bunch of text
			panelBody = $A.createComponentFromConfig({
				componentDef : {descriptor: "markup://ui:outputText"},
				attributes : {
					values : {
						value : "Salesforce.com Salesforce.com"
					}
				}
			});
		} else {
			// body of panel is more interesting
			panelBody.push($A.createComponentFromConfig({
                componentDef : {descriptor: "markup://ui:outputText"},
                attributes : {
                    values : {
                        value : "New panel body"
                    }
                }
            }));
			panelBody.push($A.createComponentFromConfig({
				componentDef : { descriptor: "markup://uitest:panel2_Tester"},
				attributes : {
					values : {
                        showFirstButton : cmp.get("v.showFirstButton")
                    }                    
                }
			}));
		}
		config["body"] = panelBody;

		// create panel
		$A.get("e.ui:createPanel").setParams(
				{
					panelType : type,
					visible : cmp.get("v.isVisible"),
					panelConfig : config,
					closeOnLocationChange : $A.util.getBooleanValue(cmp.get("v.closeOnLocationChange")),

					onCreate : $A.getCallback(function(panel) {
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
					}),

					onDestroy : $A.getCallback(function(panelId) {
						cmp.find("idDestroyed").set("v.value", panelId);
					})
				}).fire();
	}

})