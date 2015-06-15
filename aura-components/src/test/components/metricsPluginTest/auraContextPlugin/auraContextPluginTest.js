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
    /**
     * Tests for AuraContextPlugin.js
     */

    /**
     * Verify the method the plugin binds to is accessible.
     */
    testMethodAccessible: {
        test: function(cmp) {
            $A.test.assertDefined($A.getContext()["merge"]);
        }
    },

    /**
     * Verify original method called and passed original parameter with plugin enabled.
     */
    testOriginalFunctionCalled: {
        test: function(cmp) {
            var actual;
            $A.metricsService.enablePlugin("defRegistry");
            var mockContext = {"componentDefs": [{"descriptor":"boo"},{"descriptor":"hoo"}]};
            var mockFunction = function(otherContext) {
                actual = otherContext;
            };
            var override = $A.test.overrideFunction($A.getContext(), "merge", mockFunction);
            $A.test.addCleanup(function() { override.restore(); });

            $A.getContext().merge(mockContext);

            $A.test.assertDefined(actual, "Original $A.context.merge function never called");
            $A.test.assertEquals(mockContext, actual, "Did not receive expected parameter to $A.context.merge");
        }
    }
})