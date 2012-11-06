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
    /**
     * Basic validation of helper definition client side.
     * Verify the methods you expect to see and also methods that you don't expect to see.
     */
    testGetHelper: {
        attributes : {},

        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assertNotNull(helper.a);
            aura.test.assertNotNull(helper.b);
            aura.test.assertNotNull(!helper.c);
        }
    },

    testGetHelperDef: {
        attributes : {},

        test: function(component){
            var helperDef = component.getDef().getHelperDef();
            aura.test.assertNotNull(helperDef);
            aura.test.assertNotNull(helperDef.getFunctions);
            aura.test.assertNotNull(helperDef.getFunctions());
            aura.test.assertEquals("HelperDef", helperDef.auraType);
        }
    },

    testFunctions: {
        attributes : {},

        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assertEquals("func A", helper.a());
            aura.test.assertEquals("func B", helper.b());
        }
    },
    /**
     * Assert that components can have additional helper inherited from parents.
     */
    testInheritedFunctions: {
        attributes : {},

        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assertEquals("func Z", helper.z());
            aura.test.assertEquals("func superSuperZ on Super Super", helper.superSuperz());
        }
    },
    /**
     * Assert helpers were usable in Renderer functions.
     */
    testRender : {
        test : function(component){
            //This property is set in a render method
            //Which proves that the helper made it into the method signature as expected
            aura.test.assertNotNull(component.renderHelper, "Helper not passed into render()");
            aura.test.assertNotNull(component.afterRenderHelper, "Helper not passed into afterRender()");
            //Components won't rerender unless they are actually dirty, so forcing it.
            component.getValue("v.dirty").setValue("1");
            $A.rerender(component);
            aura.test.assertNotNull(component.rerenderHelper, "Helper not passed into rerender()");
            aura.test.assertEquals("func A", component.rerenderHelper.a());
            $A.unrender(component);
            aura.test.assertNotNull(component.unrenderHelper, "Helper not passed into unrender()");
        }
    },
    /**
     * Assert helpers were usable in client controllers.
     */
    testAction : {
        test : function(component){
            //This property is set in an action
            //Which proves that the helper made it into the action signature as expected
            component.get("c.myAction").run();
            aura.test.assertNotNull(component.myActionHelper);
            aura.test.assertEquals("func A", component.myActionHelper.a());
        }
    },
    /**
     * Assert that helpers can accept and process arguments.
     */
    testPassingArguments: {
        test : function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            var argument = 'Aura';
            aura.test.assertEquals("Argument passed="+argument, helper.methodWithArgs(argument), "Passing arguments to helpers failed.");
        }

    }
})
