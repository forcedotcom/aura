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
    testListenToComposedEventsOnSameNSChildComponent: function(cmp, event, helper) {
        var child = cmp.find('sameNamespaceChild').getElement();
        var testUtils = cmp.get('v.testUtils');
        helper.dispatchEventAndAssert(
            testUtils,
            child,
            'customevent',
            function() {
                child.dispatchEventOnSelf();
            },
            child, // currentTarget should be the child's host element
            child // target should be the child's host element
        );
    },

    testListenToComposedEventsOnSameNSShadowElement: function(cmp, event, helper) {
        var child = cmp.find('sameNamespaceChild').getElement();
        var testUtils = cmp.get('v.testUtils');
        helper.dispatchEventAndAssert(
            testUtils,
            child,
            'composedevent',
            function() {
                child.dispatchComposedEventOnChildNode();
            },
            child, // currentTarget should be the child's host element
            child // target should be retargeted to child's host element
        );
    },

    testListenToComposedEventsOnCrossNSChildComponent: function(cmp, event, helper) {
        var child = cmp.find('crossNamespaceChild');
        var testUtils = cmp.get('v.testUtils');
        var container = document.querySelector('#container-crossnamespace-child');
        helper.dispatchEventAndAssert(
            testUtils,
            container,
            'customevent',
            function() {
                child.dispatchEventOnSelf();
            },
            container, // currentTarget should be the container enclosing the child's host element
            container // target should be container enclosing the child's host element(because we skip opaque elements)
        );
    },

    testListenToComposedEventsOnCrossNSShadowElement: function(cmp, event, helper) {
        var child = cmp.find('crossNamespaceChild');
        var testUtils = cmp.get('v.testUtils');
        var container = document.querySelector('#container-crossnamespace-child');
        helper.dispatchEventAndAssert(
            testUtils,
            container,
            'composedevent',
            function() {
                child.dispatchComposedEventOnChildNode();
            },
            container, // currentTarget should be the child's host element
            null // TODO: Bug in LWC where event is not retargeted in certain conditions: https://github.com/salesforce/lwc/pull/870
            // container // target should be retargeted to child's host element
        );
    }
})
