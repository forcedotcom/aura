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
import org.auraframework.def.design.DesignSectionDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

import java.util.Iterator;
import java.util.Set;

public class DesignSectionDefHandlerTest extends AuraImplTestCase {
    private static final String SECTION = "<design:section/>";
    private static final String SECTION_NAME = "<design:section name=\"%s\"/>";

    public DesignSectionDefHandlerTest(String name) {
        super(name);
    }

    public void testNoSection() throws Exception {
        Set<DesignSectionDef> layout = setupDesignSectionDef("");
        assertTrue("Layout did not contain no sections", layout.size() == 0);
    }

    public void testSection() throws Exception {
        Set<DesignSectionDef> sections = setupDesignSectionDef(SECTION);
        assertTrue("Layouts did not contain one section", sections.size() == 1);
    }

    public void testMultipleSectionOrder() throws Exception {
        StringBuilder sectionsStr = new StringBuilder();
        sectionsStr.append(String.format(SECTION_NAME, "5"));
        sectionsStr.append(String.format(SECTION_NAME, "b"));
        sectionsStr.append(String.format(SECTION_NAME, "a"));
        sectionsStr.append(String.format(SECTION_NAME, "0"));
        sectionsStr.append(String.format(SECTION_NAME, "someName"));
        Iterator<DesignSectionDef> sections = setupDesignSectionDef(sectionsStr.toString()).iterator();
        assertEquals("Section name was incorrect, order may not be maintained", "5", sections.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "b", sections.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "a", sections.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "0", sections.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "someName", sections.next().getName());
    }

    public void testMultipleSectionSameName() throws Exception {
        //Both name="" and not specifying a name should result in the same name
        String sections = String.format(SECTION_NAME, "") + SECTION;
        try {
            setupDesignSectionDef(sections);
            fail("Layouts can not contain duplicate sections");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class,"Section with name");
        }
    }

    private Set<DesignSectionDef> setupDesignSectionDef(String markup) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", ""));

        DefDescriptor<DesignDef> designDesc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        addSourceAutoCleanup(designDesc, String.format("<design:component><design:layout>%s</design:layout></design:component>", markup));

        return designDesc.getDef().getDefaultDesignLayoutDef().getSections();
    }
}
