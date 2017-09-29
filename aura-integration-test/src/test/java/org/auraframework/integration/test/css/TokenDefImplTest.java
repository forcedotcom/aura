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

import com.google.common.collect.ImmutableList;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.token.TokenDefImpl;
import org.auraframework.impl.css.token.TokenDefImpl.Builder;
import org.auraframework.impl.system.DefinitionImplUnitTest;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.List;

/**
 * Unit tests for {@link TokenDefImpl}.
 */
public class TokenDefImplTest extends DefinitionImplUnitTest<TokenDefImpl, TokenDef, TokenDef, TokenDefImpl.Builder> {
    private Builder builder;

    @Mock
    protected DefDescriptor<TokensDef> parentDescriptor;

    @Override
    public void setUp() throws Exception {
        super.setUp();

        this.descriptorName = "valid";
        this.qualifiedDescriptorName = "valid";

        this.builder = new Builder();
        this.builder.setValue("valid");
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

    @Test
    public void testEqualsWhenSame() throws Exception {
        TokenDef def1 = buildDefinition();
        assertEquals(def1, def1);
    }

    @Test
    public void testNotEquals() throws Exception {
        builder.setValue("def1");
        TokenDef def1 = buildDefinition();
        builder.setValue("def2");
        TokenDef def2 = buildDefinition();
        assertFalse(def1.equals(def2));
        assertFalse(def2.equals(def1));
        assertFalse(def2.equals(null));
    }

    @Test
    public void testInvalidName() throws Exception {
        this.descriptorName = "1";
        this.qualifiedDescriptorName = "1";
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Invalid token name");
        }
    }

    @Test
    public void testMissingValue() throws Exception {
        builder.setValue(null);

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Missing required attribute 'value'");
        }
    }

    @Test
    public void testGetValue() throws Exception {
        builder.setValue("test");
        assertEquals("test", buildDefinition().getValue());
    }

    @Test
    public void testGetAllowedProperties() throws Exception {
        builder.setAllowedProperties("border-color");
        assertTrue(buildDefinition().getAllowedProperties().contains("border-color"));
    }

    @Test
    public void testUnknownProperty() throws Exception {
        builder.setAllowedProperties("wall-maria");

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Unknown CSS property 'wall-maria'");
        }
    }

    @Test
    public void testMultipleUnknownProperties() throws Exception {
        builder.setAllowedProperties("color, wall-maria");

        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Unknown CSS property 'wall-maria'");
        }
    }

    @Test
    public void testChecksForTokenFunctionInValue() throws Exception {
        // test values that should throw error for using the token function
        List<String> tests = ImmutableList.of(
                    "token(foo)",
                    "  token(foo)",
                    "1px token(foo)",                    
                    "t(foo)",
                    "  t(foo)",
                    "1px t(foo)"
                );

        for (String test : tests) {
            builder.setValue(test);
            try {
                buildDefinition().validateDefinition();
                fail("Expected an exception for referencing token function: " + test);
            } catch (Exception e) {
                assertExceptionMessageStartsWith(e, InvalidDefinitionException.class, "Token function not allowed");
            }
        }
        
        // stuff that should not throw an error
        tests = ImmutableList.of(
                "linear-gradient()"
                );

        for (String test : tests) {
            builder.setValue(test);
            try {
                buildDefinition().validateDefinition();               
            } catch (Exception e) {
                fail("Did NOT expect an exception for referencing token function: " + test);
            }
        }
    }
    
    @Test
    public void testUntrustedNamspaceAllowedTokenValues() throws Exception {
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.when(parentDescriptor.getNamespace()).thenReturn("testUntrustedNamspaceAllowedTokenValues");
        Mockito.when(configAdapter.isInternalNamespace(parentDescriptor.getNamespace())).thenReturn(false);

        builder.setConfigAdapter(configAdapter);

        List<String> tests = ImmutableList.of(
                "#111",
                "#0070d2",
                "0.1",
                "24px",
                "5%",
                "1 1 1 1",
                "100%/1.5 'Salesforce Sans', Arial, sans-serif",
                "rgba(255, 255, 255, 0.15)",
                "block",
                "hypen-ated",
                "under_scored"
                );

        for (String test : tests) {
            builder.setValue(test);
            try {
                buildDefinition().validateDefinition();
            } catch (Exception e) {
                fail("did not expect to catch an exception");
            }
        }
    }

    @Test
    public void testUntrustedNamespaceDisallowedTokenValues() throws Exception {
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.when(parentDescriptor.getNamespace()).thenReturn("testUntrustedNamspaceAllowedTokenValues");
        Mockito.when(configAdapter.isInternalNamespace(parentDescriptor.getNamespace())).thenReturn(false);

        builder.setConfigAdapter(configAdapter);

        List<String> tests = ImmutableList.of(
                "blue;} body { color: red !important }",
                "expression(alert('xss'))",
                "exp/* */ression",
                "&#x0065;xpression",
                "\\000065xpression",
                "\\65xpression",
                "\\65 xpression",
                "e\\x\\pr\\e\\ssion",
                "expression ",
                "exPressioN",
                "url('javascript:alert()')",
                "url(xss.htc)",
                "URL(xss.htc)",
                "ur\\00006c(xss.htc)",
                "j\\ava\\scri\\pt"
                );

        for (String test : tests) {
            builder.setValue(test);
            try {
                buildDefinition().validateDefinition();
                fail("Expected an exception for test expression: " + test);
            } catch (Exception e) {
                assertExceptionType(e, InvalidDefinitionException.class);
                String errorMsg = "Illegal character in token value";
                String errorMsg2 = "is not allowed in token values";

                if (!e.getMessage().contains(errorMsg) && !e.getMessage().contains(errorMsg2)) {
                    fail(String.format("Expected message containing: [%s], but got message: [%s] %nFor test expression %s",
                            errorMsg, e.getMessage(), test));
                }
            }
        }
    }
}
