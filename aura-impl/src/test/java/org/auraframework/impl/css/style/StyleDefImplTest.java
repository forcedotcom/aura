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
package org.auraframework.impl.css.style;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;

import com.google.common.collect.Sets;

/**
 * Tests for StyleDefImpl.
 * 
 * @since 0.0.240
 */
public class StyleDefImplTest extends AuraImplTestCase {
    public StyleDefImplTest(String name) {
        super(name);
    }

    /**
     * StyleDef must have a dependency on a NamespaceDef.
     */
    public void testAppendDependenciesHasNamespaceDef() throws Exception {
        String name = String.format("%s.someStyle", auraTestingUtil.getNonce(getName()));
        DefDescriptor<StyleDef> styleDesc = Aura.getDefinitionService().getDefDescriptor(name, StyleDef.class);
        auraTestingUtil.addSourceAutoCleanup(styleDesc, ".THIS {}");

        DefDescriptor<NamespaceDef> namespaceDesc = Aura.getDefinitionService().getDefDescriptor(
                String.format("%s://%s", DefDescriptor.MARKUP_PREFIX, styleDesc.getNamespace()), NamespaceDef.class);
        auraTestingUtil.addSourceAutoCleanup(namespaceDesc, "<aura:namespace></aura:namespace>");

        // need to restart context because old context will not have the new
        // namespace registered
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);

        StyleDef styleDef = styleDesc.getDef();
        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        styleDef.appendDependencies(deps);

        DefDescriptor<NamespaceDef> nsDesc = Aura.getDefinitionService().getDefDescriptor(styleDesc.getNamespace(),
                NamespaceDef.class);
        assertTrue("NamespaceDef missing from StyleDef dependencies", deps.contains(nsDesc));
    }
}
