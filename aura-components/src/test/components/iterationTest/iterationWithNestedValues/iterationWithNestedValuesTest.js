/*
 * Copyright (C) 2017 salesforce.com, inc.
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
    testUpdatesValueReference: {
        test: function(cmp) {
            var expected = "standard-updated-value";
            var standardInput = cmp.find("standardInput").getElement();

            standardInput.focus();
            standardInput.value = expected;
            standardInput.dispatchEvent(new Event("change"));
            standardInput.blur();

            $A.test.addWaitFor(expected, function() {
                return cmp.find("iteration").getElements()[0].value;
            });
        }
    },

    // This is currently broken and needs to be fixed as the reference is not updated
    _testUpdatesValueReferenceInIteration: {
        test: function(cmp) {
            var expected = "iteration-updated-value";
            var iterationInput = cmp.find("iteration").getElements()[0];

            iterationInput.value = expected;
            iterationInput.dispatchEvent(new Event("change"));

            $A.test.addWaitFor(expected, function() {
                return cmp.find("standardInput").getElement().value;
            });
        }
    },

    testKeepsValueAfterBlurInIteration: {
        test: function(cmp) {
            var expected = "iteration-keeps-value-after-blur";
            var iterationInput = cmp.find("iteration").getElements()[0];

            iterationInput.focus();
            iterationInput.value = expected;
            iterationInput.dispatchEvent(new Event("change"));
            iterationInput.blur();

            $A.test.addWaitFor(expected, function() {
                return iterationInput.value;
            });
        }
    }
})
