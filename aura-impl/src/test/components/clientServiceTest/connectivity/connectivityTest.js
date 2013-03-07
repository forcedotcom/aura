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
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());
                $A.test.addWaitFor(true, function() { return aura.util.trim(component.get("v.eventsFired")) == "layoutChange"; });
            }, function(component) {
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") != ""; });
            }, function(component) {
                $A.test.assertEquals("SUCCESS", component.get("v.actionStatus"));
                $A.test.assertEquals("layoutChange", component.get("v.eventsFired"));
                // ensure we still think we're connected
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },

    /**
     * Calling server action on unknown host throws connectionLost event.
     */
    testConnectionLost : {
        testLabels : ["UnAdaptableTest"],
        attributes : { __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return aura.util.trim(component.get("v.eventsFired")) == "layoutChange"; });
            }, function(component) {
                $A.test.setTestTimeout(30000);
                component.getValue("v.host").setValue("http://invalid.salesforce.com");
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") != ""; });
            }, function(component) {
                $A.test.assertEquals("INCOMPLETE", component.get("v.actionStatus"));
                $A.test.assertEquals("layoutChange connectionLost", aura.util.trim(component.get("v.eventsFired")));
                $A.test.assertFalse($A.clientService.isConnected());
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") != ""; });
            }, function(component) {
                // connectionLost event is not repeated
                $A.test.assertEquals("layoutChange connectionLost", aura.util.trim(component.get("v.eventsFired")));
                // still offline
                $A.test.assertFalse($A.clientService.isConnected());
            }]
    },

    /**
     * Calling server action succeeds after a prior connection failure.
     */
    testConnectionResumed : {
        testLabels : ["UnAdaptableTest"],
        attributes : { __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return aura.util.trim(component.get("v.eventsFired")) == "layoutChange"; });
            }, function(component) {
                $A.test.setTestTimeout(30000);
                component.getValue("v.host").setValue("http://invalid.salesforce.com");
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") != ""; });
            }, function(component) {
                $A.test.assertEquals("INCOMPLETE", component.get("v.actionStatus"));
                $A.test.assertEquals("layoutChange connectionLost", aura.util.trim(component.get("v.eventsFired")));
                $A.test.assertFalse($A.clientService.isConnected());
                component.getValue("v.host").setValue(undefined); // restore to default
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") == "SUCCESS"; });
            }, function(component) {
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", aura.util.trim(component.get("v.eventsFired")));
                $A.test.assertTrue($A.clientService.isConnected());
                component.find("button").get("e.press").fire();
                $A.test.addWaitFor(true, function() { return component.get("v.actionStatus") == "SUCCESS"; });
            }, function(component) {
                // connectionResumed event is not repeated
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", aura.util.trim(component.get("v.eventsFired")));
                // still online
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },

    /**
     * Changing layout with no connection throws connectionLost and layoutFailed events.
     */
    testConnectionLostForLayout : {
        testLabels : ["UnAdaptableTest"],
        attributes : { host : "http://invalid.salesforce.com", __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return aura.util.trim(component.get("v.eventsFired")) == "connectionLost layoutFailed layoutChange"; });
            }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
            }]
    },

    /**
     * Changing layout after a prior connection failure succeeds.
     */
    testConnectionResumedForLayout : {
        testLabels : ["UnAdaptableTest"],
        attributes : { host : "http://invalid.salesforce.com", __layout : "#" },
        test : [function(component) {
                $A.test.addWaitFor(true, function() { return aura.util.trim(component.get("v.eventsFired")) == "connectionLost layoutFailed layoutChange"; });
            }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
                component.getValue("v.host").setValue(undefined); // restore to default
                $A.historyService.set("action");
                $A.test.addWaitFor(true, function() { return aura.util.trim(component.get("v.eventsFired")) == "connectionLost layoutFailed layoutChange connectionResumed layoutChange"; });
            }, function(component) {
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    }
})
