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
	debugLogEventListener : function(cmp, event, helper) {
		var outputTab;
		var type = event.getParam("type");
		var output = event.getParam("message");

		if (type === "event") {
			helper.output(cmp, "eventData", output);
		} else {
			if (type === "Warning") {
				helper.output(cmp, "warningsData", output);
			} else if (type === "Error") {
				helper.output(cmp, "errorsData", output);
			}
			// also log everything to console
			helper.output(cmp, "consoleData", output);
		}
	},

	errorEventListener : function(cmp, event, helper) {
		var msg = event.getParam("message");
		var err = event.getParam("error");
		var output = "Error Message: " + msg + "\nError Detail: " + err + "\n";
		helper.output(cmp, "errorsData", output);
	},

	storageEventListener : function(cmp, event, helper) {
		var storageName = cmp.get("v.storageName");
		var storage = opener.$A.storageService.getStorage(storageName);
		var name = storage.getName();
        var maxSize = storage.getMaxSize();

        var status;
        storage.getSize().then(function(size) {
            $A.run(function() {
                if (size < maxSize / 2) {
                    status = "Ok";
                } else if (size < maxSize) {
                    status = "Warning";
                } else {
                    status = "Critical";
                }

                var value = Math.round(size * 100) / 100;
                var output = "Storage[" + storageName + "] " + value + " K (" + name + ") Status: " + status;
                helper.output(cmp, "storageData", output);
            });
        });
	},

	cmpStats : function(cmp, event, helper) {
		var output = "";
		var views = ["component", "componentDef", "controllerDef",
					 "modelDef", "providerDef", "rendererDef", "helperDef"];
		var statsViews = ["actionReferenceValue", "arrayValue",
					 "functionCallValue", "mapValue", "passthroughValue",
					 "propertyReferenceValue", "value"];

		// if in STATS mode include STATS's views.
		if (opener.$A.getContext().getMode() == "STATS") {
			views = views.concat(statsViews);
		}

		output += $A.util.getUrl() + "\n";
		for (var i=0; i<views.length; i++) {
			output += helper.getAuraStats(cmp, views[i]);
		}
		helper.output(cmp, "cmpData", output);
	},

	checkAccessibility : function(cmp, event, helper){
	    var array = opener.$A.devToolService.checkAccessibility();
		helper.output(cmp, "accessibilityData", array, true);
	}
})
