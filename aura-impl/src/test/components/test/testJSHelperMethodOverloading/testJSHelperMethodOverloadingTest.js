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
     * Verify that local helper methods override inherited helper methods.
     *
     */
    testOverRidingInheritedFunctions: {
        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assertEquals("func superSuperZ in child component", helper.superSuperz(), "The local helper method did not override the parent's helper.");
        }
    },
    /**
     * Verify function overloading in helpers inherited from parent.
     * W-937966
     */
    _testOverloadingInheritedFunctions: {
        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assertEquals("func superSuperY on Super Super", helper.superSuperY(), "Failed to overload parent helper method.");
            var arg = 'aura';
            aura.test.assertEquals("func superSuperY on child component", helper.superSuperY(arg), "Parent helper method quashed the local helper method.");
        }
    },
    /**
     * Verify function overloading in helpers.
     * W-937966
     */
    _testOverloadingFunctions: {
        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            var arg = 'aura';
            aura.test.assertEquals("func x on component, with one argument", helper.localX(arg), "Failed to overload helper method.");
            aura.test.assertEquals("func x on component, with two argument", helper.localX(arg, arg), "Overloading helper method does not work.");
        }
    }

})
