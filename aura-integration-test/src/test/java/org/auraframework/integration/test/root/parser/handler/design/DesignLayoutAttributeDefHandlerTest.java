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
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignLayoutItemDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

import java.util.Iterator;
import java.util.Set;

public class DesignLayoutAttributeDefHandlerTest extends AuraImplTestCase {
    private final static String ATTRIBUTE = "<design:layoutAttribute name=\"%s\"/>";
    private final static String VALID_ATTRIBUTE = "test";
    private final static String VALID_ATTRIBUTE_2 = "something";
    private final static String VALID_ATTRIBUTE_3 = "else";
    public DesignLayoutAttributeDefHandlerTest(String name) {
        super(name);
    }

    public void testLayoutAttributeWithInvalidAttribute() throws Exception {
        final String invalidAttr = "NotAAttribute";
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", ""));

        DefDescriptor<DesignDef> designDesc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        addSourceAutoCleanup(designDesc, String.format("<design:component><design:layout>" +
                "<design:section><design:layoutItems>%s</design:layoutItems></design:section>" +
                "</design:layout></design:component>", String.format(ATTRIBUTE, invalidAttr)));
        try {
            designDesc.getDef();
            fail("Attribute was accepted in a design layout");
        } catch (Exception e) {
            assertExceptionType(e, DefinitionNotFoundException.class);
        }
    }

    public void testLayoutAttribute() throws Exception {
        Set<DesignLayoutItemDef> items = setupDesignLayoutAttributeDef(String.format(ATTRIBUTE, VALID_ATTRIBUTE),
                VALID_ATTRIBUTE);
        assertTrue("Design component was not discovered", items.size() == 1);

        DesignLayoutItemDef item = items.iterator().next();
        assertTrue("Design component was determined as a attribute", item.isAttribute());

    }

    public void testLayoutAttributeOrder() throws Exception {
        StringBuilder items = new StringBuilder();
        items.append(String.format(ATTRIBUTE, VALID_ATTRIBUTE));
        items.append(String.format(ATTRIBUTE, VALID_ATTRIBUTE_2));
        items.append(String.format(ATTRIBUTE, VALID_ATTRIBUTE_3));
        Iterator<DesignLayoutItemDef> itemsList = setupDesignLayoutAttributeDef(
                items.toString(), VALID_ATTRIBUTE_2, VALID_ATTRIBUTE_3, VALID_ATTRIBUTE).iterator();
        DesignLayoutItemDef item = itemsList.next();
        assertTrue("Design item did not set isAttribute correctly", item.isAttribute());
        assertEquals("Design layout component name incorrect, possibly order not maintained",
                VALID_ATTRIBUTE, item.getAttribute().getName());

        item = itemsList.next();
        assertTrue("Design item did not set isAttribute correctly", item.isAttribute());
        assertEquals("Design layout component name incorrect, possibly order not maintained",
                VALID_ATTRIBUTE_2, item.getAttribute().getName());

        item = itemsList.next();
        assertTrue("Design item did not set isAttribute correctly", item.isAttribute());
        assertEquals("Design layout component name incorrect, possibly order not maintained",
                VALID_ATTRIBUTE_3, item.getAttribute().getName());
    }

    private Set<DesignLayoutItemDef> setupDesignLayoutAttributeDef(String markup, String... attrs) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        StringBuilder builder = new StringBuilder();
        for (String attr : attrs) {
            builder.append(String.format("<aura:attribute name=\"%s\" type=\"string\"/>", attr));
        }
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", builder.toString()));

        DefDescriptor<DesignDef> designDesc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        builder = new StringBuilder();
        for (String attr : attrs) {
            builder.append(String.format("<design:attribute name=\"%s\"/>", attr));
        }
        addSourceAutoCleanup(designDesc, String.format("<design:component>%s<design:layout>" +
                "<design:section><design:layoutItems>%s</design:layoutItems></design:section>" +
                "</design:layout></design:component>", builder.toString(), markup));

        return designDesc.getDef().getDefaultDesignLayoutDef()
                .getSections().iterator().next().getItems().iterator().next().getItems();
    }
}
