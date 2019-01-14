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
    
    setUp: function (cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testListenToComposedEventsOnSameNamespaceChildComponent: {
        test: function(cmp) {
            cmp.testListenToComposedEventsOnSameNSChildComponent();
        }
    },

    testListenToComposedEventsOnSameNamespaceShadowElement: {
        test: function(cmp) {
            cmp.testListenToComposedEventsOnSameNSShadowElement();
        }
    },

    testListenToComposedEventsOnCrossNamespaceChildComponent: {
        test: function(cmp) {
            cmp.testListenToComposedEventsOnCrossNSChildComponent();
        }
    },

    testListenToComposedEventsOnCrossNamespaceShadowElement: {
        test: function(cmp) {
            cmp.testListenToComposedEventsOnCrossNSShadowElement();
        }
    }

})