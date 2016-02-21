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
import org.auraframework.impl.AuraImplTestCase;

public class DesignOptionDefHandlerTest extends AuraImplTestCase {
    private static final String OPTION = "<design:option %s/>";
    private static final String NAME = "name=\"%s\"";
    private static final String VALUE = "value=\"%s\"";

    public DesignOptionDefHandlerTest(String name) {
        super(name);
    }

    public void testOptionWithNameOnly() throws Exception {
        DesignDef def = setupDesignOptionDef("test", null);
        assertNotNull("Design option should return null when no value is passed in", def.getOption("test"));
        assertEquals("Design option should contain option name", "test", def.getOption("test").get(0).getKey());
    }

    public void testOptionWithNameAndValue() throws  Exception {
        DesignDef def = setupDesignOptionDef("name", "value");
        assertEquals("Design option did not return correct value", "value", def.getOption("name").get(0).getValue());
    }

    public void testOptionWithNoAttributes() throws Exception {
        try {
            setupDesignOptionDef(null, null);
            fail("Design option required feed, name, did not validate");
        } catch (Exception e) {
            //success
        }
    }

    public void testOptionDoesNotAllowChild() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", ""));

        DefDescriptor<DesignDef> designDesc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        addSourceAutoCleanup(designDesc,
                "<design:component><design:option name=\"name\"><aura:attribute name=\"test\"/></design:option></design:component>");
        try {
            definitionService.getDefinition(designDesc);
            fail("Design option should not allow child tags");
        } catch (Exception e) {
            //success
        }
    }

    private DesignDef setupDesignOptionDef(String name, String value) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", ""));

        DefDescriptor<DesignDef> designDesc = definitionService.getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        String des;
        if (name == null && value == null) {
            des = String.format(OPTION, "");
        } else if (value == null) {
            des = String.format(OPTION,
                    String.format(NAME, name));
        } else if (name == null) {
            des = String.format(OPTION,
                    String.format(VALUE, value));
        } else {
            des = String.format(OPTION,
                    String.format(NAME, name) + " " + String.format(VALUE, value));
        }
        addSourceAutoCleanup(designDesc, String.format("<design:component>%s</design:component>", des));

        return definitionService.getDefinition(designDesc);
    }
}
