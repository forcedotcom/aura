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
import org.auraframework.def.design.DesignItemsDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

import java.util.Iterator;
import java.util.Set;

public class DesignItemsDefHandlerTest extends AuraImplTestCase {
    private final static String ITEMS = "<design:layoutitems/>";
    private final static String ITEMS_NAME = "<design:layoutitems name=\"%s\"/>";
    public DesignItemsDefHandlerTest(String name) {
        super(name);
    }

    public void testNoItemsSection() throws Exception {
        assertTrue("Section had items or was null", setupDesignItemsDef("").size() == 0);
    }
    
    public void testWithItemsSections() throws Exception {
        
        assertTrue("Expected section to have one items", setupDesignItemsDef(ITEMS).size() == 1);
    }
    
    public void testWithMultipleSectionsOrder() throws Exception {
        StringBuilder sectionsStr = new StringBuilder();
        sectionsStr.append(String.format(ITEMS_NAME, "5"));
        sectionsStr.append(String.format(ITEMS_NAME, "b"));
        sectionsStr.append(String.format(ITEMS_NAME, "a"));
        sectionsStr.append(String.format(ITEMS_NAME, "0"));
        sectionsStr.append(String.format(ITEMS_NAME, "someName"));
        Iterator<DesignItemsDef> items = setupDesignItemsDef(sectionsStr.toString()).iterator();
        assertEquals("Section name was incorrect, order may not be maintained", "5", items.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "b", items.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "a", items.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "0", items.next().getName());
        assertEquals("Section name was incorrect, order may not be maintained", "someName", items.next().getName());
    }

    public void testMultipleItemsSameName() throws Exception {
        //Both name="" and not specifying a name should result in the same name
        String items = String.format(ITEMS_NAME, "") + ITEMS;
        try {
            setupDesignItemsDef(items);
            fail("Design layout items can not contain duplicate sections");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class,"Design layout items");
        }
    }

    private Set<DesignItemsDef> setupDesignItemsDef(String markup) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", ""));

        DefDescriptor<DesignDef> designDesc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        addSourceAutoCleanup(designDesc, String.format("<design:component><design:layout><design:section>%s</design:section></design:layout></design:component>", markup));

        return designDesc.getDef().getDefaultDesignLayoutDef().getSections().iterator().next().getItems();
    }
}
