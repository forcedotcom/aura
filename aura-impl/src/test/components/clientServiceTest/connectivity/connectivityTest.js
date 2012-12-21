/*
 * Copyright (C) 2012 salesforce.com, inc.
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
	browsers:["GOOGLECHROME"],
    /**
     * Calling server action on default host succeeds.
     */
    testConnection : {
        attributes : { __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return component.get("v.eventsFired").trim() == "layoutChange"; });
            }, function(component) {
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") != ""; });
            }, function(component) {
                $A.test.assertEquals("SUCCESS", component.get("v.actionStatus"));
                $A.test.assertEquals("layoutChange", component.get("v.eventsFired"));
            }]
    },

    /**
     * Calling server action on unknown host throws noConnection event.
     */
    testNoConnection : {
        testLabels : ["UnAdaptableTest"],
        attributes : { __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return component.get("v.eventsFired").trim() == "layoutChange"; });
            }, function(component) {
                $A.test.setTestTimeout(30000);
                component.getValue("v.host").setValue("http://invalid.salesforce.com");
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") != ""; });
            }, function(component) {
                $A.test.assertEquals("INCOMPLETE", component.get("v.actionStatus"));
                $A.test.assertEquals("layoutChange noConnection", component.get("v.eventsFired").trim());
            }]
    },

    /**
     * Calling server action after a prior connection failure succeeds.
     */
    testConnectionRestored : {
        testLabels : ["UnAdaptableTest"],
        attributes : { __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return component.get("v.eventsFired").trim() == "layoutChange"; });
            }, function(component) {
                $A.test.setTestTimeout(30000);
                component.getValue("v.host").setValue("http://invalid.salesforce.com");
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") != ""; });
            }, function(component) {
                $A.test.assertEquals("INCOMPLETE", component.get("v.actionStatus"));
                $A.test.assertEquals("layoutChange noConnection", component.get("v.eventsFired").trim());
                component.getValue("v.host").setValue(undefined); // restore to default
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") == "SUCCESS"; });
            }, function(component) {
                $A.test.assertEquals("layoutChange noConnection", component.get("v.eventsFired").trim()); // no additional events
            }]
    },

    /**
     * Changing layout with no connection throws noConnection and layoutFailed events.
     */
    testNoConnectionForLayout : {
        testLabels : ["UnAdaptableTest"],
        attributes : { host : "http://invalid.salesforce.com", __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return component.get("v.eventsFired").trim() == "noConnection layoutFailed layoutChange"; });
            }]
    },

    /**
     * Changing layout after a prior connection failure succeeds.
     */
    testConnectionRestoredForLayout : {
        testLabels : ["UnAdaptableTest"],
        attributes : { host : "http://invalid.salesforce.com", __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return component.get("v.eventsFired").trim() == "noConnection layoutFailed layoutChange"; });
            }, function(component) {
                component.getValue("v.host").setValue(undefined); // restore to default
                $A.historyService.set("action");
                $A.test.addWaitFor(true, function() { return component.get("v.eventsFired").trim() == "noConnection layoutFailed layoutChange layoutChange"; });
            }]
    }
})
