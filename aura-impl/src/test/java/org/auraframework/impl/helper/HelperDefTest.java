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
package org.auraframework.impl.helper;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

/**
 * @hierarchy Aura.Unit Tests.Components.HelperDef
 * @priority medium
 * @userStorySyncIdOrName a07B0000000EuDd
 *
 */
public class HelperDefTest extends AuraImplTestCase {

    public HelperDefTest(String name){
        super(name);
    }
    /**
     * Verify the default naming convention for helper files.
     * By default:
     * the helper is assumed to be a javascript helper
     * the name of the helper is assumed to be <componentName>Helper.js
     * So use a test component and verify the HelperDefs
     * @priority high
     * @throws Exception
     */
    public void testDefaultNamingConventionForHelper() throws Exception{
        ComponentDef cmpDef = Aura.getDefinitionService().getDefinition("test:test_SimpleHelper", ComponentDef.class);
        assertNotNull(cmpDef);
        HelperDef hlprDef = cmpDef.getHelperDef();
        assertNotNull("Failed to extract helper def on component.",hlprDef);
        assertTrue("By default BaseComponentDefHandler shoud assume that a component has a javascript helper.",
                hlprDef instanceof JavascriptHelperDef);
        assertEquals("Failed to create correct helper def for test component.",
                "js://test.test_SimpleHelper", hlprDef.getDescriptor().getQualifiedName());
    }

    /**
     * Verify helper assignment can be overriden.
     * A component or application can be explicitly directed to use a certain helper.
     *   For example:
     *   <aura:component helper="js://test.testJSHelper">
     *   </aura:component>
     *   When you specify the helper you should only specify the directory the helper is in. This is usually another component's folder.
     */
    public void testExplicitHelperDirectiveSpecification() throws Exception{
        String explicitHelperMarkup = String.format(baseComponentTag, "helper='js://test.test_SimpleHelper'", "");
        DefDescriptor<ComponentDef> cmpDescriptor = addSource(explicitHelperMarkup, ComponentDef.class);
        assertNotNull(cmpDescriptor.getDef());
        HelperDef hlprDef = cmpDescriptor.getDef().getHelperDef();
        assertNotNull("Failed to extract helper def on component.",hlprDef);
        assertTrue("Helper directive provided a javascript helper, but component definition has something else.",
                hlprDef instanceof JavascriptHelperDef);
        assertEquals("Failed to create correct helper def for test component.",
                "js://test.test_SimpleHelper", hlprDef.getDescriptor().getQualifiedName());

    }

    /**
     * Verify that specifying an bad helper throws a runtime exception.
     * 1. Specify a non existing helper
     * 2. Specify a helper using wrong format of qualified name
     * 3. Specify the qualified name of a component which has no helper
     * 4. A component which has a bad helper file
     */
    public void testInvalidHelpers() throws Exception{

        String cmpReferingToNonExistingHelperMarkup = String.format(baseComponentTag, "helper='js://test.blahBleeblue"+System.currentTimeMillis()+"'", "");
        DefDescriptor<ComponentDef> testCmp1 = addSource(cmpReferingToNonExistingHelperMarkup, ComponentDef.class);
        try{
            testCmp1.getDef();
            fail("should not be able to process component refering to non existing component folder.");
        }catch(DefinitionNotFoundException e){}

        String cmpWithBadHelperSpecificationFormatMarkup = String.format(baseComponentTag, "helper='js://test:test_SimpleHelper'", "");
        DefDescriptor<ComponentDef> testCmp2 = addSource(cmpWithBadHelperSpecificationFormatMarkup, ComponentDef.class);
        try{
            testCmp2.getDef();
            fail("The helper directive used the wrong format. It is using a colon(':') as seperator. Should have failed.");
        }catch(AuraRuntimeException e){assertTrue(e.getMessage().contains("Invalid Descriptor Format"));}

        DefDescriptor<ComponentDef> cmpWithNoHelper = this.addSource(String.format(baseComponentTag, "",""), ComponentDef.class);
        assertNull(cmpWithNoHelper.getDef().getHelperDef());
        String cmpReferingCmpWithNoHelperMarkup = String.format(baseComponentTag, "helper='js://"+cmpWithNoHelper.getNamespace()+"."+cmpWithNoHelper.getName()+"'", "");
        DefDescriptor<ComponentDef> testCmp3 = addSource(cmpReferingCmpWithNoHelperMarkup, ComponentDef.class);
        try{
            testCmp3.getDef();
            fail("should not be able to process component refering to non existing helper");
        }catch(DefinitionNotFoundException e){}

        try{
            Aura.getDefinitionService().getDefinition("test:test_ComponentWithBadHelper", ComponentDef.class);
            fail("Should have failed to fetch component definition because helper file is incomplete.");
        }catch(AuraRuntimeException e){assertNotNull(e);}
    }
    /**
     * Verify that helpers are inherited from parent.
     * Verify that components extending Abstract and non Abstract components, inherit their parents helper methods.
     * Verify inheritance across multiple levels.
     * @throws Exception
     */
    //TODO: Should we not know at the server side that the parent has helper defs, why do we do it only clientside?
    // Also, looks like we are going to support serverside helpers since HelperDef has a isLocal() method.
    public void _testInheritedHelpers() throws Exception{
       ComponentDef cmpDef = Aura.getDefinitionService().getDefinition("test:testJSHelperInheritedOnly", ComponentDef.class);

       HelperDef hlprDef = cmpDef.getHelperDef();
       assertNotNull("Failed to extract helper def inherited from parent component.",hlprDef);
       assertTrue("failed to recognize javascript helper def on parent.",
               hlprDef instanceof JavascriptHelperDef);
       assertEquals("Failed to use parent's helper def.",
               "js://test.testJSHelperSuper", hlprDef.getDescriptor().getQualifiedName());
    }
    /**
     * Verify that specifying multiple remote helpers fails validation check.
     * 1. Create two test components with their helper files.
     * 2. Create a test component which uses the helpers of the test components in Step 1.
     * 3. Ask for the definition of component and verify that it caused a AuraRuntimeException
     * @throws Exception
     */
    //TODO:W-948976
    public void _testMultipleRemoteHelperShouldFail() throws Exception{
        String cmpWithMultipleHelperMarkup = String.format(baseComponentTag, "helper='js://test.test_SimpleHelper, js://test.testJSHelper'", "");
        DefDescriptor<ComponentDef> testCmp = addSource(cmpWithMultipleHelperMarkup, ComponentDef.class);
        try{
            testCmp.getDef();
            fail("should not be able to specify multiple remote helpers.");
        }catch(AuraRuntimeException e){}
    }

}
