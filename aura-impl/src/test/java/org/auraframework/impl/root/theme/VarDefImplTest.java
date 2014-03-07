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

import org.auraframework.Aura;
import org.auraframework.def.VarDef;
import org.auraframework.impl.root.theme.VarDefImpl.Builder;
import org.auraframework.impl.system.DefinitionImplUnitTest;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Unit tests for {@link VarDefImpl}.
 */
public class VarDefImplTest extends DefinitionImplUnitTest<VarDefImpl, VarDef, VarDef, VarDefImpl.Builder> {
    private Builder builder;

    public VarDefImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        this.qualifiedDescriptorName = "valid";
        this.builder = new Builder();
        this.builder.setValue("valid");
    }

    @Override
    protected void setupValidateReferences() throws Exception {
        super.setupValidateReferences();
        
        ContextService contextService = Aura.getContextService();
		if (testAuraContext != null) {
            contextService.endContext();
        }
        
        testAuraContext = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
    }

    public void testEqualsWhenSame() throws Exception {
        VarDef def1 = buildDefinition();
        assertEquals(def1, def1);
    }

    public void testNotEquals() throws Exception {
        builder.setValue("def1");
        VarDef def1 = buildDefinition();
        builder.setValue("def2");
        VarDef def2 = buildDefinition();
        assertFalse(def1.equals(def2));
        assertFalse(def2.equals(def1));
        assertFalse(def2.equals(null));
    }

    public void testInvalidName() throws Exception {
        this.qualifiedDescriptorName = "1";
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Invalid var name");
        }
    }

    public void testMissingValue() throws Exception {
        builder.setValue(null);

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Missing required attribute 'value'");
        }
    }

    public void testGetValue() throws Exception {
        builder.setValue("test");
        assertEquals("test", buildDefinition().getValue());
    }

    @Override
    protected Builder getBuilder() {
        return builder;
    }
}
