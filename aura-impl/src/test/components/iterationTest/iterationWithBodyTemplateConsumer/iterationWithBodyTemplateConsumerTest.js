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
     * Verify value providers are wired up correctly. More specifically, make sure we get the model data from this
     * component's model, instead of trying to use the inner component's model (which does not exist and will error out).
     */
    testValueProviderForIteration_ModelData: {
        test: function(cmp) {
            var name = cmp.find("iterationCmp").getDef().getDescriptor().getQualifiedName();
            $A.test.assertEquals("markup://iterationTest:iterationWithBodyTemplate", name, "Unexpected component rendered.");

            var iterationText = $A.test.getText(cmp.find("iterationCmp").getElement());
            $A.test.assertEquals("ModelModelModel", iterationText, "Iteration did not output expected data from Model.");
        }
    },

    /**
     * Verify value providers are wired up correctly by passing along a reference to an attribute defined on both this
     * and the inner component which contains the iteration.
     */
    testValueProviderForIteration_AttributeData: {
        test: function(cmp) {
            var name = cmp.find("iterationAttributeData").getDef().getDescriptor().getQualifiedName();
            $A.test.assertEquals("markup://iterationTest:iterationWithBodyTemplate", name, "Unexpected component rendered.");

            var failMsg = "Iteration did not output expected data from attribute";
            var expectedText = "DefaultText.DefaultText.DefaultText.";
            var iterationText = $A.test.getText(cmp.find("iterationAttributeData").getElement());
            var innerCmpText = "iterationWithBodyTemplate.iterationWithBodyTemplate.iterationWithBodyTemplate.";

            if (iterationText === innerCmpText) {
                failMsg = "Iteration incorrectly resolved against inner component's value provider.";
            }
            $A.test.assertEquals(expectedText, iterationText, failMsg);
        }
    }
})