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

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignAttributeDefaultDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

import java.util.List;

public class DesignAttributeDefaultDefHandlerTest extends AuraImplTestCase {
    private static final String DESIGN_TEMPLATE = "<design:component><design:attribute name=\"%s\">" +
            "<design:attributeDefault>%s</design:attributeDefault>" +
            "</design:attribute></design:component>";

    @Test
    public void testBasicDefault() throws Exception {
        DesignAttributeDef attribute = createComponentAndDesignWithAttributeDefault("<ui:button label=\"test\"/>");
        DesignAttributeDefaultDef defaultDef = attribute.getAttributeDefault();
        assertNotNull(defaultDef);
        List<DefinitionReference> defaultComponents = defaultDef.getComponentRefs();
        assertEquals("Expected there to be one component ref in the list", 1, defaultComponents.size());
    }

    @Test
    public void testDefaultWithHTMLTag() throws Exception {
        try {
            createComponentAndDesignWithAttributeDefault("<div/>");
            fail("Should only allow component tags in attributeDefault");
        } catch (Exception e) {
            assertExceptionMessageEndsWith(e, InvalidDefinitionException.class,
                    "HTML tags are disallowed in attribute defaults, only components may be set.");
        }
    }

    @Test
    public void testDefaultWithAuraSystemTag() throws Exception {
        try {
            createComponentAndDesignWithAttributeDefault("<aura:set/>");
            fail("Should only allow component tags in attributeDefault");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, DefinitionNotFoundException.class,
                    "No COMPONENT named markup://aura:set found");
        }
    }

    private DesignAttributeDef createComponentAndDesignWithAttributeDefault(String body) throws Exception {
        final String attr = "attr";
        final String cmp = String.format(baseComponentTag, "", "<aura:attribute name=\"" + attr + "\" type=\"Object[]\"/>");
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(StringSourceLoader.DEFAULT_NAMESPACE + ":",
                ComponentDef.class, null);
        getAuraTestingUtil().addSourceAutoCleanup(cmpDesc, cmp, NamespaceAccess.INTERNAL);

        DefDescriptor<DesignDef> desc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        getAuraTestingUtil().addSourceAutoCleanup(desc, String.format(DESIGN_TEMPLATE, attr, body), NamespaceAccess.INTERNAL);

        return definitionService.getDefinition(desc).getAttributeDesignDef(attr);
    }
}
