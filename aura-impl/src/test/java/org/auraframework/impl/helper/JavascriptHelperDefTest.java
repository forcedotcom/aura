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
package org.auraframework.impl.helper;

import org.auraframework.Aura;
import org.auraframework.def.HelperDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;

/**
 * @hierarchy Aura.Unit Tests.Components.HelperDef.JavascriptHelperDef
 * @priority medium
 * @userStorySyncIdOrName a07B0000000EuDd
 */
public class JavascriptHelperDefTest extends AuraImplTestCase {
    public JavascriptHelperDefTest(String name) {
        super(name);
    }

    /**
     * JavascriptHelperDef can be used only on the client side.
     * 
     * @throws Exception
     */
    public void testIsNotLocal() throws Exception {
        HelperDef hlprDef = Aura.getDefinitionService().getDefinition("js://test.test_SimpleHelper", HelperDef.class);
        assertNotNull("Failed to extract helper def on component.", hlprDef);
        assertTrue("Should have obtained a javascript helper def.", hlprDef instanceof JavascriptHelperDef);
        assertEquals("Failed to create correct helper def for test component.", "js://test.test_SimpleHelper", hlprDef
                .getDescriptor().getQualifiedName());
        assertFalse("Javascript helper defs are not local.", hlprDef.isLocal());
    }

    /**
     * Verify that javascript helper defs are serializable.
     * 
     * @throws Exception
     */
    public void testJavascriptHelperDefAreSerializable() throws Exception {
        HelperDef hlprDef = Aura.getDefinitionService().getDefinition("js://test.test_SimpleHelper", HelperDef.class);
        assertNotNull("Failed to extract helper def on component.", hlprDef);
        this.serializeAndGoldFile(hlprDef);
    }
}
