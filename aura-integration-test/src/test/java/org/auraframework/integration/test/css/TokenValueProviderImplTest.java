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
import org.auraframework.Aura;
import org.auraframework.adapter.StyleAdapter;
import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokenDescriptorProvider;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.token.TokenCacheImpl;
import org.auraframework.impl.css.token.TokenValueProviderImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.TokenValueNotFoundException;
import org.junit.Test;

import javax.inject.Inject;
import java.util.List;
import java.util.Set;

/**
 * Unit tests for {@link TokenValueProviderImpl}.
 */
public class TokenValueProviderImplTest extends StyleTestCase {
    private DefDescriptor<StyleDef> def;

    @Inject
    DefinitionService definitionService;

    @Inject
    StyleAdapter styleAdapter;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        this.def = addStyleDef(".THIS{}");
    }

    /** check that a simple resolves */
    @Test
    public void testSimple() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        assertEquals("red", setup().getValue("color", null));
    }

    /** confirm that we get the right inherited token value */
    @Test
    public void testInherited() throws QuickFixException {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        addNsTokens(tokens().parent(parent).token("margin", "10px"));
        assertEquals("red", setup().getValue("color", null));
    }

    /** confirm that we get the value from an override instead of the original */
    @Test
    public void testOverriddenDirectly() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().token("color", "blue"));
        assertEquals("blue", setupOverride(override).getValue("color", null));
    }

    /** confirm that we get the value from an override through inheritance instead of the original */
    @Test
    public void testOverriddenThroughInheritance() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "blue"));
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().parent(parent));
        assertEquals("blue", setupOverride(override).getValue("color", null));
    }

    /** confirm that multiple overrides can be specified */
    @Test
    public void testMultipleOverrides() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> o1 = addSeparateTokens(tokens().token("skip1", "one"));
        DefDescriptor<TokensDef> o2 = addSeparateTokens(tokens().token("skip2", "two"));
        DefDescriptor<TokensDef> o3 = addSeparateTokens(tokens().token("color", "three"));

        assertEquals("three", setupOverride(ImmutableList.of(o1, o2, o3)).getValue("color", null));
    }

    /** confirm that we get the value from an override when multiple are present */
    @Test
    public void testMultipleOverridesThroughInheritance() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "blue"));
        DefDescriptor<TokensDef> o1 = addSeparateTokens(tokens().token("skip1", "one"));
        DefDescriptor<TokensDef> o2 = addSeparateTokens(tokens().parent(parent));
        DefDescriptor<TokensDef> o3 = addSeparateTokens(tokens().token("skip2", "two"));
        assertEquals("blue", setupOverride(ImmutableList.of(o1, o2, o3)).getValue("color", null));
    }

    @Provider
    public static final class TmpProvider implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return Aura.getDefinitionService().getDefDescriptor("tokenProviderTest:tvp", TokensDef.class);
        }
    }

    /** the override may utilize a provider, in which case we should find and use the concrete def */
    @Test
    public void testOverrideUsesProvider() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));

        DefDescriptor<StyleDef> style = addStyleDef(".THIS{}");

        String prov = "java://" + TmpProvider.class.getName();
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().descriptorProvider(prov));

        assertEquals("blue", setupOverride(styleAdapter.getNamespaceDefaultDescriptor(style), override).getValue("color", null));
    }

    /** check that we get an error if the namespace default doesn't exist */
    @Test
    public void testNamespaceDefaultDoesntExist() throws QuickFixException {
        try {
            setup().getValue("color", null);
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No TOKENS");
        }
    }

    /** check that we get an error if the token doesn't exist */
    @Test
    public void testTokenDoesntExist() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        try {
            setup().getValue("roloc", null);
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, TokenValueNotFoundException.class, "was not found");
        }
    }

    /** confirm that we get an error if the override is specified but non existent */
    @Test
    public void testAppTokensDoesntExist() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> override = definitionService.getDefDescriptor("idont:exist", TokensDef.class);

        try {
            setupOverride(override).getValue("color", null);
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No TOKENS");
        }
    }

    /**
     * if the namespace default doesn't have the token, but the override does, it should still resolve. However note
     * that this is overall an error and would be caught by StyleDef#validateReferences.
     */
    @Test
    public void testSpecifiedInOverrideButMissingFromNamespaceDefault() throws QuickFixException {
        addNsTokens(tokens().token("font", "arial"));
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().token("color", "blue"));
        assertEquals("blue", setupOverride(override).getValue("color", null));
    }

    /** check that we get an error if the number of parts in the argument are too many */
    @Test
    public void testMalformedLong() throws QuickFixException {
        addNsTokens(tokens().token("color", "red"));
        try {
            setup().getValue("blah.blah.blah", null);
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "Invalid number of parts");
        }
    }

    /** confirm that cross referencing a token defined in the same def resolves */
    @Test
    public void testCrossReferenceSelf() throws QuickFixException {
        addNsTokens(tokens().token("color", "red").token("myColor", "{!color}"));
        assertEquals("red", setup().getValue("myColor", null));
    }

    /** confirm that cross referencing a token defined in a parent def resolves */
    @Test
    public void testCrossReferenceInherited() throws QuickFixException {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        addNsTokens(tokens().parent(parent).token("myColor", "{!color}"));
        assertEquals("red", setup().getValue("color", null));
    }

    /** confirm that an error is thrown if the cross referenced token doesn't exist */
    @Test
    public void testCrossReferenceDoesntExist() throws QuickFixException {
        addNsTokens(tokens().token("myColor", "{!color}"));

        try {
            setup().getValue("myColor", null);
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, TokenValueNotFoundException.class, "was not found");
        }
    }

    @Test
    public void testExtractTokenNamesNoCrossRef() throws QuickFixException {
        addNsTokens(tokens().token("color1", "red"));
        Set<String> names = setup().extractTokenNames("color1", true);
        assertEquals("didn't get expected size", 1, names.size());
        assertTrue(names.contains("color1"));
    }

    @Test
    public void testExtractTokenNamesFollowCrossRefsFalse() throws QuickFixException {
        addNsTokens(tokens().token("color1", "red").token("color2", "{!color1}"));
        Set<String> names = setup().extractTokenNames("color2", false);
        assertEquals("didn't get expected size", 1, names.size());
        assertTrue(names.contains("color2"));
    }

    @Test
    public void testExtractTokenNamesCrossRefSelf() throws QuickFixException {
        addNsTokens(tokens().token("color1", "red").token("color2", "{!color1}"));
        Set<String> names = setup().extractTokenNames("color2", true);
        assertEquals("didn't get expected size", 2, names.size());
        assertTrue(names.contains("color1"));
        assertTrue(names.contains("color2"));
    }

    @Test
    public void testExtractTokenNamesCrossRefParent() throws QuickFixException {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color1", "red"));
        addNsTokens(tokens().parent(parent).token("color2", "{!color1}"));
        Set<String> names = setup().extractTokenNames("color2", true);
        assertEquals("didn't get expected size", 2, names.size());
        assertTrue(names.contains("color1"));
        assertTrue(names.contains("color2"));
    }

    @Test
    public void testExtractTokenNamesCrossRefMultiple() throws QuickFixException {
        addNsTokens(tokens()
                .token("color1", "red")
                .token("color2", "{!color1}")
                .token("color3", "{!color2}")
                .token("color4", "{!color3}")
                .token("color5", "{!color4}")
                .token("colorA", "{!color1}")
                .token("colorB", "{!colorA}")
                .token("colorC", "{!colorB}"));
        Set<String> names = setup().extractTokenNames("color5 + colorB", true);
        assertEquals("didn't get expected size", 7, names.size());
        assertTrue(names.contains("color1"));
        assertTrue(names.contains("color2"));
        assertTrue(names.contains("color3"));
        assertTrue(names.contains("color4"));
        assertTrue(names.contains("color5"));
        assertTrue(names.contains("colorA"));
        assertTrue(names.contains("colorB"));
        assertFalse(names.contains("colorC"));
    }

    private TokenValueProvider setup() throws QuickFixException {
        return setup(def);
    }

    private TokenValueProvider setup(DefDescriptor<StyleDef> def) throws QuickFixException {
        return new TokenValueProviderImpl(styleAdapter.getNamespaceDefaultDescriptor(def), null, ResolveStrategy.RESOLVE_NORMAL);
    }

    private TokenValueProvider setupOverride(DefDescriptor<TokensDef> override) throws QuickFixException {
        return setupOverride(styleAdapter.getNamespaceDefaultDescriptor(def), override);
    }

    private TokenValueProvider setupOverride(List<DefDescriptor<TokensDef>> overrides) throws QuickFixException {
        return setupOverride(styleAdapter.getNamespaceDefaultDescriptor(def), overrides);
    }

    private TokenValueProvider setupOverride(DefDescriptor<TokensDef> namespace, DefDescriptor<TokensDef> override)
            throws QuickFixException {
        return setupOverride(namespace, ImmutableList.of(override));
    }

    private TokenValueProvider setupOverride(DefDescriptor<TokensDef> namespace, List<DefDescriptor<TokensDef>> overrides)
            throws QuickFixException {
        return new TokenValueProviderImpl(namespace, new TokenCacheImpl(definitionService, overrides), ResolveStrategy.RESOLVE_NORMAL);
    }
}
