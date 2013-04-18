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
     * These methods were inherited from the parent of the component.
     */
    testInheritedHelper :{
        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assertEquals("func Z", helper.z() , "Failed to inherit and invoke helper method of parent.");
            aura.test.assertEquals("func superSuperZ on Super Super", helper.superSuperz(), "Failed to inherit and invoke helper method of parent over 2 levels of inheritance." );
        }
    },
    /**
     * These methods were on the helper file explicitly specified in the component markup using the helper='' directive.
     */
    testExplicitHelper : {
        test: function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assertEquals("method A of simple helper", helper.methodAOfSimpleHelper(), "Failed to invoke helper method of helper specified using helper directive in component mark up");
        }

    },
    /**
     * When an explicit helper method is specified, local helper file in component directory is ignored
     */
    testHelperLocalToComponent:{
        test:function(component){
            var helper = component.getDef().getHelper();
            aura.test.assertNotNull(helper);
            aura.test.assert(!helper.localMethodFortestJSHelperExplicit, "Should not be able to see local helper methods when helper is explicitly defined on component." );
        }
    }


})
