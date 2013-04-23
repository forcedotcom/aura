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
     * Assert that component has a helper inherited from parent.
     */
    testGetHelper: {
        attributes : {},

        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assert(helper);
        }
    },
    /**
     * Assert characteristics of helper inherited from parent.
     */
    testGetHelperDef: {
        attributes : {},

        test: function(component){
            var helperDef = component.getDef().getHelperDef();
            aura.test.assert(helperDef);
            aura.test.assert(helperDef.getFunctions);
            aura.test.assert(helperDef.getFunctions());
            aura.test.assertEquals(helperDef.auraType, "HelperDef");
        }
    },
    /**
     * Assert that helper functions inherited from parent are usable.
     */
    testInheritedFunctions: {
        attributes : {},

        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assert(helper);
            aura.test.assertEquals("func Z", helper.z(), "helper method should have been inherited from parent.");
            aura.test.assertEquals("func superSuperZ on Super Super", helper.superSuperz(), "helper method should have been inherited from parent's parent.");
        }
    }
})
