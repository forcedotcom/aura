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
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    testInitialStateOfTrackedProperty: {
        test: function(cmp) {
            cmp.find("test-cmp").assertInitialState();
        }
    },

    // Mutate the properties of a tracked value and verify that UI is updated
    testStateOfTrackedProertyAfterMutation: {
        test: function(cmp) {
            var testCmp = cmp.find("test-cmp");
            testCmp.modify();
            return testCmp.assertUpdatedState();
        }
    },

    // Reassign values to tracked property and verify that UI is updated
    testStateOfTrackedPropertyAfterReassigningValues: {
        test: function(cmp) {
            var testCmp = cmp.find("test-cmp");
            testCmp.reassign();
            return testCmp.assertUpdatedState();
        }
    },

    // Verify that a tracked value sent to a secure child is readonly
    testTrackedDataToSecureChildPropIsReadOnly: {
        test: function(cmp) {
            cmp.find("test-cmp").assertTrackedDataSetOnSecureChildPropertyIsReadOnly();
        }
    },

    // Verify that a tracked value sent to a unsecure child is readonly
    testTrackedDataToUnsecureChildPropIsReadOnly: {
        test: function(cmp) {
            cmp.find("test-cmp").assertTrackedDataSetOnUnsecureChildPropertyIsReadOnly();
        }
    },

    // Verify that a tracked value sent to secure child property is live
    testTrackedDataSentToSecureChildIsLive: {
        test: function(cmp) {
            cmp.find("test-cmp").assertTrackedDataSetOnSecureChildIsLive();
        }
    },

    // Verify that a tracked value sent to unsecure child property is live
    testTrackedDataSentToUnsecureChildIsLive: {
        test: function(cmp) {
            cmp.find("test-cmp").assertTrackedDataSetOnUnsecureChildIsLive();
        }
    },

    // Verify when a tracked value send to secure child method and the child mutates it, parent is reactive
    testTrackedDataSentToSecureChildMethodIsLive: {
        test: function(cmp) {
            return cmp.find("test-cmp").assertTrackedDataSentToSecureChildMethodIsLive();
        }
    },

    // Verify when a tracked value send to secure child method and the child mutates it, parent is reactive
    testTrackedDataSentToUnsecureChildMethodIsLive: {
        test: function(cmp) {
            return cmp.find("test-cmp").assertTrackedDataSentToUnsecureChildMethodIsLive();
        }
    },

    // Verify when a child component passes along a tracked value to the grand child using public property, the read only proxy behavior is retained
    testTrackedDataSentToGrandChildPropIsReadOnly:{
        test: function(cmp) {
            cmp.find("test-cmp").assertTrackedDataSetOnSecureGrandChildPropertyIsReadOnly();
        }
    },

    // Verify when a child component passes along a tracked value to the grand child using public methods, the reactive proxy behavior is retained
    testTrackedDataSentToGrandChildMethodIsLive: {
        test: function(cmp) {
            cmp.find("test-cmp").assertTrackedDataSentToSecureGrandChildMethodIsLive();
        }
    }
})