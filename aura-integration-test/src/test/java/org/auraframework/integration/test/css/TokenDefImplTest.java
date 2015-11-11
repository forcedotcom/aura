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
package org.auraframework.integration.test.css;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.token.TokenDefImpl;
import org.auraframework.impl.css.token.TokenDefImpl.Builder;
import org.auraframework.impl.system.DefinitionImplUnitTest;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.mockito.Mock;
import org.mockito.Mockito;

/**
 * Unit tests for {@link TokenDefImpl}.
 */
public class TokenDefImplTest extends DefinitionImplUnitTest<TokenDefImpl, TokenDef, TokenDef, TokenDefImpl.Builder> {
    private ConfigAdapter configAdapter;
    private Builder builder;

    @Mock
    protected DefDescriptor<TokensDef> parentDescriptor;

    public TokenDefImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();

        this.qualifiedDescriptorName = "valid";

        this.builder = new Builder();
        this.builder.setValue("valid");

        //Mockito.when(parentDescriptor.getNamespace()).thenReturn("tokenDefImplTest");

        configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.when(configAdapter.isPrivilegedNamespace(parentDescriptor.getNamespace())).thenReturn(true);
    }

    @Override
    protected Builder getBuilder() {
        return builder;
    }

    @Override
    protected TokenDef buildDefinition(Builder builder) throws Exception {
        builder.setParentDescriptor(this.parentDescriptor);
        return super.buildDefinition(builder);
    }

    public void testEqualsWhenSame() throws Exception {
        TokenDef def1 = buildDefinition();
        assertEquals(def1, def1);
    }

    public void testNotEquals() throws Exception {
        builder.setValue("def1");
        TokenDef def1 = buildDefinition();
        builder.setValue("def2");
        TokenDef def2 = buildDefinition();
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
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Invalid token name");
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

    public void testInvalidTokenValueChar() throws Exception {
        builder.setValue("blue;} body { color: red !important }");

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Illegal character in token value");
        }
    }

    public void testInvalidTokenValueChar2() throws Exception {
        builder.setValue("expression(alert('BOO'))");

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Illegal character in token value");
        }
    }

    public void testGetAllowedProperties() throws Exception {
        builder.setAllowedProperties("border-color");
        assertTrue(buildDefinition().getAllowedProperties().contains("border-color"));
    }

    public void testUnknownProperty() throws Exception {
        builder.setAllowedProperties("wall-maria");

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Unknown CSS property 'wall-maria'");
        }
    }

    public void testMultipleUnknownProperties() throws Exception {
        builder.setAllowedProperties("color, wall-maria");

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Unknown CSS property 'wall-maria'");
        }
    }
}
