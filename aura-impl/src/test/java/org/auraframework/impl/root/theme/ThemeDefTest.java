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
package org.auraframework.impl.root.theme;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;

/**
 * Unit tests for {@link ThemeDef}.
 */
public class ThemeDefTest extends AuraImplTestCase {
    public ThemeDefTest(String name) {
        super(name);
    }

    public void testGetSource() {
        MasterDefRegistry reg = Aura.getContextService().getCurrentContext().getDefRegistry();
        DefinitionService defService = Aura.getDefinitionService();
        DefDescriptor<ThemeDef> descriptor = defService.getDefDescriptor("themeDefTest:namespaceTheme", ThemeDef.class);
        Source<ThemeDef> src = reg.getSource(descriptor);
        assertNotNull(src);
    }

    public void testAttributes() throws Exception {
        DefinitionService defService = Aura.getDefinitionService();
        ThemeDef def = defService.getDefinition("themeDefTest:namespaceTheme", ThemeDef.class);

        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = def.getAttributeDefs();

        assertEquals("expected theme def to contain 2 attributes", attributes.size(), 2);

        DefDescriptor<AttributeDef> color = DefDescriptorImpl.getInstance("color", AttributeDef.class);
        DefDescriptor<AttributeDef> margin = DefDescriptorImpl.getInstance("margin", AttributeDef.class);

        assertNotNull("expected theme def to contain color attribute", attributes.get(color));
        assertNotNull("expected theme def to contain margin attribute", attributes.get(margin));
    }

    public void testVariablePresent() throws Exception {
        DefinitionService defService = Aura.getDefinitionService();
        ThemeDef def = defService.getDefinition("themeDefTest:namespaceTheme", ThemeDef.class);
        assertEquals("expected theme def variable value to be correct", "#222222", def.variable("color").get());
    }

    public void testVariableAbsent() throws Exception {
        DefinitionService defService = Aura.getDefinitionService();
        ThemeDef def = defService.getDefinition("themeDefTest:namespaceTheme", ThemeDef.class);
        assertFalse("expected theme def variable value to be absent", def.variable("font").isPresent());
    }
}
