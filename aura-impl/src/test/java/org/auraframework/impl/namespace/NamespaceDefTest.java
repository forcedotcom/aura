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
package org.auraframework.impl.namespace;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Client.Type;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

public class NamespaceDefTest extends AuraImplTestCase {

    public NamespaceDefTest(String name) {
        super(name);
    }

    public void testGetNamespaceSource() {
        MasterDefRegistry reg = Aura.getContextService().getCurrentContext().getDefRegistry();
        DefinitionService defService = Aura.getDefinitionService();
        DefDescriptor<NamespaceDef> descriptor = defService.getDefDescriptor("test", NamespaceDef.class);
        Source<NamespaceDef> src = reg.getSource(descriptor);
        assertNotNull(src);

        descriptor = DefDescriptorImpl.getInstance("nonExistantNamespace", NamespaceDef.class);
        src = reg.getSource(descriptor);
        assertNull(src);
    }

    public void testGetNamespaceDef() throws Exception {
        DefinitionService defService = Aura.getDefinitionService();
        DefDescriptor<NamespaceDef> descriptor = defService.getDefDescriptor("aura", NamespaceDef.class);
        NamespaceDef def = descriptor.getDef();
        assertNotNull(def);

        descriptor = defService.getDefDescriptor("nonExistantNamespace", NamespaceDef.class);
        try {
            descriptor.getDef();
            fail("Expected Exception when trying to compile non-existent NamespaceDef");
        } catch (Exception e) {
            checkExceptionFull(e, DefinitionNotFoundException.class,
                    "No NAMESPACE named markup://nonExistantNamespace found");
        }

        descriptor = defService.getDefDescriptor("namespaceDefTest", NamespaceDef.class);
        def = descriptor.getDef();
        assertNotNull(def);
        assertEquals("red", def.getStyleTokens().get("FOO"));
    }

    public void testStyleTokens() throws Exception {
        DefinitionService defService = Aura.getDefinitionService();
        StyleDef styleDef = defService.getDefinition("namespaceDefTest.testStyleTokens", StyleDef.class);
        assertEquals(
                ".namespaceDefTestTestStyleTokens {\n  background-color: red;\n  color: FOOL;\n  border-color: black;\n}\n",
                styleDef.getCode(Type.WEBKIT));
    }
}
