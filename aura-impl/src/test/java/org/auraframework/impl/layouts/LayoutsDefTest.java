/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.layouts;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.LayoutDef;
import org.auraframework.def.LayoutItemDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * @hierarchy Aura.Unit Tests.Components.LayoutsDef
 * @priority medium
 * @userStorySyncIdOrName a07B0000000EGkF
 */
public class LayoutsDefTest extends AuraImplTestCase {

    public LayoutsDefTest(String name) {
        super(name);
    }

    /**
     * Test to verify layouts obtained from Definition Service.
     * 
     * @throws Exception
     */
    public void testLayoutsFromService() throws Exception {
        LayoutsDef layoutsDef = Aura.getDefinitionService().getDefinition("test:layouts", LayoutsDef.class);
        validateLayouts(layoutsDef);
    }

    /**
     * Test to verify layouts on Application def. Application has no explicit
     * layouts specification, its the default layouts file in the component
     * folder.
     * 
     * @throws Exception
     */
    public void testLayoutsFromApplicationDefAutoWire() throws Exception {
        ApplicationDef applicationDef = Aura.getDefinitionService().getDefinition("test:layouts", ApplicationDef.class);
        validateLayouts(applicationDef.getLayoutsDefDescriptor().getDef());
    }

    /**
     * Test to verify Layouts on Application def. Explicit specification of
     * layouts file.
     * 
     * @throws Exception
     */
    public void testLayoutsFromApplicationDefAttribute() throws Exception {
        ApplicationDef applicationDef = Aura.getDefinitionService()
                .getDefinition("test:layouts2", ApplicationDef.class);
        validateLayouts(applicationDef.getLayoutsDefDescriptor().getDef());
    }

    /**
     * "default" attribute is required. If there is no such attribute defined,
     * an exception should be thrown.
     * 
     */
    public void testLayoutsNoDefault() throws Exception {
        InvalidDefinitionException result = null;
        try {
            Aura.getDefinitionService().getDefinition("test:layoutsNoDefault", LayoutsDef.class);
            fail("Not specifying a default layout should have caused an Exception.");
        } catch (InvalidDefinitionException e) {
            result = e;
        }
        assertNotNull(result);
    }

    /**
     * The "default" layout must exist. Otherwise we should throw an exception.
     * W-931102
     */
    public void testLayoutsNonExistDefault() throws Exception {
        InvalidDefinitionException result = null;
        try {
            Aura.getDefinitionService().getDefinition("test:layoutsNonExistDefault", LayoutsDef.class);
            fail("Specifying a non existing default layout should have caused an Exception.");
        } catch (InvalidDefinitionException e) {
            result = e;
        }
        assertNotNull(result);
    }

    /**
     * The "catchall" layout must exist if it gets specified. Otherwise we
     * should throw an exception. W-931102
     */
    public void testLayoutsNonExistCatchall() throws Exception {
        InvalidDefinitionException result = null;
        try {
            Aura.getDefinitionService().getDefinition("test:layoutsNonExistCatchall", LayoutsDef.class);
            fail("Specifying a non existing layout for catch all should have caused an Exception.");
        } catch (InvalidDefinitionException e) {
            result = e;
        }
        assertNotNull(result);
    }

    public void validateLayouts(LayoutsDef layoutsDef) throws Exception {

        assertNotNull(layoutsDef);
        assertEquals("Failed to retrieve description of layout.", "layouts description", layoutsDef.getDescription());
        Collection<LayoutDef> layoutDefs = layoutsDef.getLayoutDefs();
        assertEquals(2, layoutDefs.size());

        // Feed Layout
        LayoutDef feedLayout = layoutsDef.getLayoutDef("feed");
        assertNotNull(feedLayout);
        assertEquals("Failed to retrieve description of individual layout", "layout description",
                feedLayout.getDescription());
        assertEquals(1, feedLayout.getLayoutItemDefs().size());

        LayoutItemDef item = feedLayout.getLayoutItemDef("content");
        assertNotNull(item);

        assertEquals("Failed to retrieve description of layout item", "layout item description", item.getDescription());
        List<ComponentDefRef> body = item.getBody();
        assertEquals(1, body.size());
        ComponentDefRef ref = body.get(0);
        assertEquals("markup://aura:html", ref.getDescriptor().getQualifiedName());
        assertEquals("inner", ref.getLocalId());
        Collection<?> htmlAttribs = ((HashMap<?, ?>) ref.getAttributeDefRef("HTMLAttributes").getValue()).values();
        assertEquals(1, htmlAttribs.size());
        assertEquals("self", htmlAttribs.toArray()[0]);
        assertNull(item.getCache());

        // Menu Layout
        LayoutDef menuLayout = layoutsDef.getLayoutDef("menu");
        assertNotNull(menuLayout);
        assertEquals("Menu layout was not specified any description.", null, menuLayout.getDescription());
        assertEquals(1, menuLayout.getLayoutItemDefs().size());

        item = menuLayout.getLayoutItemDef("content");
        assertNotNull(item);
        assertEquals("Content layout was not specified any description.", null, item.getDescription());
        body = item.getBody();
        assertEquals(1, body.size());
        ref = body.get(0);
        assertEquals("markup://ui:button", ref.getDescriptor().getQualifiedName());
        assertEquals("inner", ref.getLocalId());
        assertEquals("futile", ref.getAttributeDefRef("label").getValue());
        assertEquals("session", item.getCache());

    }

}
