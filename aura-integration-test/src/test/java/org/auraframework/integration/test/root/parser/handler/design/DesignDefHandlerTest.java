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
package org.auraframework.integration.test.root.parser.handler.design;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class DesignDefHandlerTest extends AuraImplTestCase {

    public DesignDefHandlerTest(String name) {
        super(name);
    }

    public void testGetElement() throws Exception {
        DesignDef element = Aura.getDefinitionService().getDefinition(setupSimpleDesignDef("<design:component label=\"some label\" />"));
        assertEquals("some label", element.getLabel());
    }

    public void testRetrieveSingleAttributeDesign() throws Exception {
        DesignDef element = Aura.getDefinitionService().getDefinition(setupSimpleDesignDef(
                "<design:component><design:attribute name=\"mystring\" required=\"true\"/></design:component>")
                );
        DesignAttributeDef child = element.getAttributeDesignDef("mystring");
        assertNotNull("Expected one AttributeDesignDef", child);
        assertTrue(child.isRequired());
    }

    public void testMultipleDesignTemplatesFailure() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(setupSimpleDesignDef(
                    "<design:component><design:template /><design:template /></design:component>")
                    );
            fail("Expected InvalidDefinitionException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    "<design:component> may only contain one design:template definition");
        }
    }

    public void testInvalidSystemAttributeName() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(setupSimpleDesignDef("<design:component foo=\"bar\" />"));
            fail("Expected InvalidDefinitionException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, "Invalid attribute \"foo\"");
        }
    }

    public void testInvalidSystemAttributePrefix() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(setupSimpleDesignDef("<design:component other:label=\"some label\" />"));
            fail("Expected InvalidDefinitionException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    "Invalid attribute \"other:label\"");
        }
    }

    private DefDescriptor<DesignDef> setupSimpleDesignDef(String markup) {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        String cmpBody = "<aura:attribute name='mystring' type='String' />";
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", cmpBody));

        DefDescriptor<DesignDef> desc = Aura.getDefinitionService().getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        addSourceAutoCleanup(desc, markup);
        return desc;
    }
}
