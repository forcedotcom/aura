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
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignLayoutItemDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

import java.util.Iterator;
import java.util.Set;

public class DesignLayoutComponentDefHandlerTest extends AuraImplTestCase {
    private final static String COMPONENT = "<design:layoutComponent name=\"%s\"/>";
    private final static String VALID_COMPONENT = "ui:button";
    private final static String ANOTHER_VALID_COMPONENT = "ui:input";
    private final static DefDescriptor<ComponentDef> VALID_CMP_DEF =
            Aura.getDefinitionService().getDefDescriptor(VALID_COMPONENT, ComponentDef.class);
    private final static DefDescriptor<ComponentDef> ANOTHER_VALID_CMP_DEF =
            Aura.getDefinitionService().getDefDescriptor(ANOTHER_VALID_COMPONENT, ComponentDef.class);

    public DesignLayoutComponentDefHandlerTest(String name) {
        super(name);
    }

    public void testLayoutComponentWithInvalidComponent() throws Exception {
        try {
            setupDesignLayoutComponentDef(String.format(COMPONENT, "NotAComponent"));
            fail("Component was accepted in a layout component");
        } catch (Exception e) {
            assertExceptionType(e, DefinitionNotFoundException.class);
        }
    }

    public void testLayoutComponent() throws Exception {
        Set<DesignLayoutItemDef> items = setupDesignLayoutComponentDef(String.format(COMPONENT, VALID_COMPONENT));
        assertTrue("Design component was not discovered", items.size() == 1);

        DesignLayoutItemDef item = items.iterator().next();
        assertFalse("Design component was determined as a attribute", item.isAttribute());

    }

    public void testLayoutComponentOrder() throws Exception {
        StringBuilder items = new StringBuilder();
        items.append(String.format(COMPONENT, VALID_COMPONENT));
        items.append(String.format(COMPONENT, ANOTHER_VALID_COMPONENT));
        items.append(String.format(COMPONENT, VALID_COMPONENT));
        Iterator<DesignLayoutItemDef> itemsList = setupDesignLayoutComponentDef(
                String.format(items.toString())).iterator();
        DesignLayoutItemDef item = itemsList.next();
        assertFalse("Design item did not set isAttribute correctly", item.isAttribute());
        assertEquals("Design layout component name incorrect, possibly order not maintained",
                VALID_CMP_DEF, item.getComponent().getComponentDef());

        item = itemsList.next();
        assertFalse("Design item did not set isAttribute correctly", item.isAttribute());
        assertEquals("Design layout component name incorrect, possibly order not maintained",
                ANOTHER_VALID_CMP_DEF, item.getComponent().getComponentDef());

        item = itemsList.next();
        assertFalse("Design item did not set isAttribute correctly", item.isAttribute());
        assertEquals("Design layout component name incorrect, possibly order not maintained",
                VALID_CMP_DEF, item.getComponent().getComponentDef());
    }

    private Set<DesignLayoutItemDef> setupDesignLayoutComponentDef(String markup) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        getAuraTestingUtil().addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", ""));

        DefDescriptor<DesignDef> designDesc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        getAuraTestingUtil().addSourceAutoCleanup(designDesc, String.format("<design:component><design:layout>" +
                "<design:section><design:layoutItems>%s</design:layoutItems></design:section>" +
                "</design:layout></design:component>", markup));

        return designDesc.getDef().getDefaultDesignLayoutDef()
                .getSections().iterator().next().getItems().iterator().next().getItems();
    }
}
