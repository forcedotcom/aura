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
package org.auraframework.impl.root.parser.handler;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignDef;
import org.auraframework.def.DesignTemplateRegionDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class DesignTemplateRegionDefHandlerTest extends AuraImplTestCase {
    public DesignTemplateRegionDefHandlerTest(String name) {
        super(name);
    }

    public void testGetElement() throws Exception {
        String name = "regionone";
        DesignTemplateRegionDef element = setupDesignTemplateRegionDef(name, "<design:region name=\"" + name + "\"/>");

        assertEquals("regionone", element.getName());
        assertTrue(element.getAllowedInterfaces().isEmpty());
    }

    public void testAllowedInterfaces() throws Exception {
        String name = "regionone";
        DesignTemplateRegionDef element = setupDesignTemplateRegionDef(name, "<design:region name=\"" + name
                + "\" allowedInterfaces=\"test:fakeInterface\"/>");

        assertEquals("regionone", element.getName());
        assertTrue(element.getAllowedInterfaces().size() == 1);

        for (DefDescriptor<InterfaceDef> intf : element.getAllowedInterfaces()) {
            assertEquals("markup://test:fakeInterface", intf.getQualifiedName());
            assertTrue(intf.exists());
        }
    }

    public void testInvalidSystemAttributeName() throws Exception {
        try {
            String name = "regionone";
            setupDesignTemplateRegionDef(name, "<design:region name=\"" + name + "\" foo=\"bar\" />");
            fail("Expected InvalidDefinitionException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, "Invalid attribute \"foo\"");
        }
    }

    public void testInvalidSystemAttributePrefix() throws Exception {
        try {
            String name = "regionone";
            setupDesignTemplateRegionDef(name, "<design:region name=\"" + name + "\" other:name=\"asdf\" />");
            fail("Expected InvalidDefinitionException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    "Invalid attribute \"other:name\"");
        }
    }

    private DesignTemplateRegionDef setupDesignTemplateRegionDef(String name, String markup) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        String cmpBody = "<aura:attribute name='mystring' type='String' />";
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", cmpBody));

        DefDescriptor<DesignDef> designDesc = Aura.getDefinitionService().getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        addSourceAutoCleanup(designDesc,
                String.format("<design:component><design:template>%s</design:template></design:component>", markup));

        return designDesc.getDef().getDesignTemplateDef().getDesignTemplateRegionDef(name);
    }
}
