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
            $A.test.assertNotNull(helper);
            $A.test.assertNotNull(helper.a);
            $A.test.assertNotNull(helper.b);
            $A.test.assertNotNull(!helper.c);
        }
    },

    testGetHelperDef: {
        attributes : {},

        test: function(component){
            var helperDef = component.getDef().getHelperDef();
            $A.test.assertNotNull(helperDef);
            $A.test.assertNotNull(helperDef.getFunctions);
            $A.test.assertNotNull(helperDef.getFunctions());
            $A.test.assertEquals("HelperDef", helperDef.auraType);
        }
    },

    testFunctions: {
        attributes : {},

        test: function(component){
            var helper = component.getDef().getHelper();
            $A.test.assertNotNull(helper);
            $A.test.assertEquals("func A", helper.a());
            $A.test.assertEquals("func B", helper.b());
        }
    },
    /**
     * Assert that components can have additional helper inherited from parents.
     */
    testInheritedFunctions: {
        attributes : {},

        test: function(component){
            var helper = component.getDef().getHelper();
            $A.test.assertNotNull(helper);
            $A.test.assertEquals("func Z", helper.z());
            $A.test.assertEquals("func superSuperZ on Super Super", helper.superSuperz());
        }
    },
    /**
     * Assert helpers were usable in Renderer functions.
     */
    testRender : {
        test : function(component){
            //This property is set in a render method
            //Which proves that the helper made it into the method signature as expected
            $A.test.assertNotNull(component.renderHelper, "Helper not passed into render()");
            $A.test.assertNotNull(component.afterRenderHelper, "Helper not passed into afterRender()");
            //Components won't rerender unless they are actually dirty, so forcing it.
            component.getValue("v.dirty").setValue("1");
            $A.rerender(component);
            $A.test.assertNotNull(component.rerenderHelper, "Helper not passed into rerender()");
            $A.test.assertEquals("func A", component.rerenderHelper.a());
            $A.unrender(component);
            $A.test.assertNotNull(component.unrenderHelper, "Helper not passed into unrender()");
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
            $A.test.assertNotNull(component.myActionHelper);
            $A.test.assertEquals("func A", component.myActionHelper.a());
        }
    },
    /**
     * Assert that helpers can accept and process arguments.
     */
    testPassingArguments: {
        test : function(component){
            var helper = component.getDef().getHelper();
            $A.test.assertNotNull(helper);
            var argument = 'Aura';
            $A.test.assertEquals("Argument passed="+argument, helper.methodWithArgs(argument), "Passing arguments to helpers failed.");
        }

    },
    /** 
     * Assert that helper are not exposed as global functions.
     */
    testHelpersAreNotExposedGlobally: {
	test : function(component){
	    var helper = component.getDef().getHelper();
	    $A.test.assertTrue($A.util.isFunction(helper.methodWithArgs));
	    $A.test.assertFalse($A.util.isFunction(window.methodWithArgs), "Helper methods exposed on window");
	    $A.test.assertFalse($A.util.isFunction(window.setFocus), "Helper methods exposed on window");
	    $A.test.assertTrue($A.util.isFunction(helper.setFocus));
	    $A.test.assertEquals("Set Focus", helper.setFocus()); 
	}
    }
})
