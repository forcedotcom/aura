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

package org.auraframework.integration.test.root.parser.handler;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class RequiredVersionDefHandlerTest extends AuraImplTestCase {

    public RequiredVersionDefHandlerTest(String name) {
        super(name);
    }

    public void testRequiredVersionPositiveCase() throws Exception {
        String markup = "<aura:require namespace='auratest' version='1.0'/>";
        DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);

        assertEquals("1.0", definitionService.getDefinition(desc).getRequiredVersion("auratest").getVersion());
    }

    //test when namespace is missing, same thing apply to version
    public void testRequiredVersionMissNamespace() throws Exception {
        String markup = "<aura:require version='1.0'/>";
        try {
            DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
            definitionService.getDefinition(desc);
            fail("we are suppose to error out when namespace is missing");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class,
                    "Attribute 'namespace' and 'version' are required on <aura:require>");
        }
    }

    //test when namespace is empty, samething apply to version
    public void testRequiredVersionEmptyNamespace() throws Exception {
        String markup = "<aura:require namespace='' version='1.0'/>";
        try {
            DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
            definitionService.getDefinition(desc);
            fail("we are suppose to error out when namespace is empty");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class,
                    "Attribute 'namespace' and 'version' are required on <aura:require>");
        }
    }

    //test when version is missing, same thing apply to version
    public void testRequiredVersionMissVersion() throws Exception {
        String markup = "<aura:require namespace='auratest'/>";
        try {
                DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
                definitionService.getDefinition(desc);
                fail("we are suppose to error out when version is missing");
        } catch (Exception e) {
                checkExceptionContains(e, InvalidDefinitionException.class,
                        "Attribute 'namespace' and 'version' are required on <aura:require>");
        }
    }

    //test when version is empty, samething apply to version
    public void testRequiredVersionEmptyVersion() throws Exception {
        String markup = "<aura:require namespace='auratest' version=''/>";
        try {
            DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
            definitionService.getDefinition(desc);
            fail("we are suppose to error out when version is empty");
        } catch (Exception e) {
                checkExceptionContains(e, InvalidDefinitionException.class,
                        "Attribute 'namespace' and 'version' are required on <aura:require>");
        }
    }

    // test when same namespace is required multi times in one component
    public void testRequireDefineSameNamespaceMutliTimes() throws Exception {
        String markup = "<aura:require namespace='auratest' version='1.0'/>" +
                        "<aura:require namespace='auratest' version='2.0'/>";
        try {
            DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
            definitionService.getDefinition(desc);
            fail("It should error out when aura:require is defined multi times in one component.");
        } catch (Exception e) {
                checkExceptionContains(e, InvalidDefinitionException.class,
                        "There is already a namespace 'auratest' on component");
        }
    }

    public void testRequireDefineMutliNamespaces() throws Exception {
        String markup = "<aura:require namespace='auratest' version='1.0'/>" +
                        "<aura:require namespace='test' version='2.0'/>";

        DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
 
        assertEquals(2, definitionService.getDefinition(desc).getRequiredVersionDefs().size());
        assertEquals("1.0", definitionService.getDefinition(desc).getRequiredVersion("auratest").getVersion());
        assertEquals("2.0", definitionService.getDefinition(desc).getRequiredVersion("test").getVersion());
    }

    //test when namespace doesn't exsit -- there is currently no check for that.
    //if we decide to do the verification on server side, enable this test
    //if we decide to the check on client side, remove this one, write a UI test, or add a component JS test.
    public void _testRequiredVersionInvalidNamespace() throws Exception {
        String markup = "<aura:require namespace='I do not exist' version='1.0'/>";
        try {
            DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
            definitionService.getDefinition(desc);
            fail("we should error out when namespace doesn't exist");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class,
                    "!!!Update the error message here when enabling this test!!!");
        }
    }

    private DefDescriptor<ComponentDef> getSimpleCmpDesc(String markup) {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", markup));
        return cmpDesc;
    }

}
