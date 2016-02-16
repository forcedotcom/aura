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
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.test.annotation.UnAdaptableTest;


@UnAdaptableTest("namespace start with c means something special in core")
public class DesignLayoutDefHandlerTest extends AuraImplTestCase {
    private final static String LAYOUT = "<design:layout> </design:layout>";
    private final static String LAYOUT_NAME = "<design:layout name=\"%s\"> </design:layout>";

    public DesignLayoutDefHandlerTest(String name) {
        super(name);
    }

    public void testNoLayout() throws Exception {
        DesignDef def = setupDesignLayoutDef("", true);
        assertNull(def.getDefaultDesignLayoutDef());
    }

    public void testLayoutDef() throws Exception {
        DesignDef def = setupDesignLayoutDef(LAYOUT, true);
        assertNotNull(def.getDefaultDesignLayoutDef());
    }

    public void testLayoutWithName() throws Exception {
        final String name = "name";
        DesignDef def = setupDesignLayoutDef(String.format(LAYOUT_NAME, name), true);
        assertNotNull(def.getDesignLayoutDefs().get(name));
    }

    public void testMultipleDefWithSameName() throws Exception {
        final String name = "name";
        String layouts = String.format(LAYOUT_NAME, name) + String.format(LAYOUT_NAME, name);
        try {
            setupDesignLayoutDef(layouts, true);
            fail("duplicate names should not be allowed.");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, String.format("Layout with name %s already defined", name));
        }
    }

    public void testLayoutInNonPrivilegedNS() throws Exception {
        try {
            setupDesignLayoutDef(LAYOUT, false);
            fail("Un-privileged NS should not be allowed to add a layout component");
        } catch (Exception e) {
            assertExceptionType(e, InvalidDefinitionException.class);
            assertTrue("Exception message was unexpected", e.getMessage().contains("<design:component> can not contain tag"));
        }
    }


    private DesignDef setupDesignLayoutDef(String markup, boolean addToPrivileged) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":",
                ComponentDef.class, null);
        getAuraTestingUtil().addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", ""), addToPrivileged);

        DefDescriptor<DesignDef> designDesc = Aura.getDefinitionService().getDefDescriptor(cmpDesc.getQualifiedName(),
                DesignDef.class);
        getAuraTestingUtil().addSourceAutoCleanup(designDesc,
                String.format("<design:component>%s</design:component>", markup), addToPrivileged);

        return designDesc.getDef();
    }
}
