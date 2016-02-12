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

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokenDescriptorProviderDef;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.java.provider.TestTokenDescriptorProvider;
import org.auraframework.impl.java.provider.TestTokenMapProvider;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.TokenValueNotFoundException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;

public class TokensDefImplTest extends StyleTestCase {
    public TokensDefImplTest(String name) {
        super(name);
    }

    public void testEmpty() throws QuickFixException {
        TokensDef emptyDef = Aura.getDefinitionService().getDefinition(addSeparateTokens("<aura:tokens />"));
        // should parse without error
        Map<String, TokenDef> tokens = emptyDef.getDeclaredTokenDefs();
        assertTrue(tokens.isEmpty());
        assertNull("Description should be null", emptyDef.getDescription());
        assertNotNull("Name must be initialized", emptyDef.getName());
    }

    public void testEquivalence() throws QuickFixException {
        TokensDef tokens1 = Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().token("color", "red")));
        TokensDef tokens2 = Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().token("color", "red")));
        assertTrue("expected tokens1 to equal tokens1", tokens1.equals(tokens1));
        assertFalse("expected tokens1 unequal to tokens2", tokens1.equals(tokens2));
        assertFalse("expected tokens2 unequal to tokens1", tokens2.equals(tokens1));
        assertFalse("expected tokens1 not to equal null", tokens1.equals(null));
    }

    public void testWithBadMarkup() {
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens("<aura:tokens><aura:token name='one' value='1' />"));
            fail("Bad markup should be caught");
        } catch (Exception e) {
            // sjsxp: XML document structures must start and end within the same entity
            // woodstox: was expecting a close tag for element <aura:tokens>
            // no common message so asserting correct exception for now
            checkExceptionContains(e, InvalidDefinitionException.class, " ");
        }
    }

    public void testTokensBadMarkupTokenNesting() {
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens("<aura:tokens><aura:token name='one' value='1'>"
                    + "	<aura:token name='two' value='2' />" + "</aura:token></aura:tokens>"));
            fail("Invalid nesting of tokens should be caught");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No children allowed");
        }
    }

    public void testUnsupportedAttributes() {
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens("<aura:tokens fakeattrib='fakeattribvalue' />"));
            fail("Unsupported attributes should not be allowed");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Invalid attribute \"fakeattrib\"");
        }
    }

    public void testHasTokenDeclared() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().token("token1", "token1"));
        assertTrue(Aura.getDefinitionService().getDefinition(desc).hasToken("token1"));
    }

    public void testHasTokenImported() throws Exception {
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("imported", "imported"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().imported(imported));
        assertTrue(desc.getDef().hasToken("imported"));
    }

    public void testHasTokenInherited() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("inherited", "inherited"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().parent(parent));
        assertTrue(desc.getDef().hasToken("inherited"));
    }

    public void testHasTokenFalse() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().token("token1", "token1"));
        assertFalse(desc.getDef().hasToken("token2"));
    }

    public void testGetTokenPresent() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().token("token1", "token1").token("token2", "token2"));
        assertEquals(desc.getDef().getToken("token1").get().toString(), "token1");
    }

    public void testGetTokenAbsent() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().token("token1", "token1").token("token2", "token2"));
        assertFalse(desc.getDef().getToken("notthere").isPresent());
    }

    /** token is only imported */
    public void testGetTokenImported() throws Exception {
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("imported", "imported"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().imported(imported));
        assertEquals("imported", desc.getDef().getToken("imported").get());
    }

    /** token is only inherited */
    public void testGetTokenInherited() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("inherited", "inherited"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().parent(parent));
        assertEquals("inherited", desc.getDef().getToken("inherited").get());
    }

    /** token is overridden by declared token */
    public void testGetTokenDirectlyOverridden() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("inherited", "v1"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().parent(parent).token("inherited", "v2"));
        assertEquals("v2", desc.getDef().getToken("inherited").get());
    }

    /** token is overridden through an import */
    public void testGetTokenImportOverridden() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("inherited", "v1"));
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("inherited", "v2"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().parent(parent).imported(imported));
        assertEquals("v2", desc.getDef().getToken("inherited").get());
    }

    /** token is overridden through an import and directly */
    public void testGetTokenDirectlyAndImportOverridden() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("inherited", "v1"));
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("inherited", "v2"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens()
                .parent(parent)
                .imported(imported)
                .token("inherited", "v3"));
        assertEquals("v3", desc.getDef().getToken("inherited").get());
    }

    /** last import should win */
    public void testGetTokenValueMultipleImports() throws Exception {
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("inherited", "v1"));
        DefDescriptor<TokensDef> imported2 = addSeparateTokens(tokens().token("blah", "blah"));
        DefDescriptor<TokensDef> imported3 = addSeparateTokens(tokens().token("inherited", "v2"));
        DefDescriptor<TokensDef> imported4 = addSeparateTokens(tokens().token("inherited", "v3"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens()
                .imported(imported)
                .imported(imported2)
                .imported(imported3)
                .imported(imported4));
        assertEquals("v3", desc.getDef().getToken("inherited").get());

    }

    public void testGetDeclaredTokenDefs() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens()
                .token("test1", "test1")
                .token("test2", "test2")
                .token("test3", "test3"));
        Map<String, TokenDef> map = desc.getDef().getDeclaredTokenDefs();

        assertEquals("didn't get expected map size", 3, map.size());
        assertTrue(map.get("test1") != null);
    }

    public void testGetDeclaredImports() throws Exception {
        DefDescriptor<TokensDef> imported1 = addSeparateTokens(tokens());
        DefDescriptor<TokensDef> imported2 = addSeparateTokens(tokens());
        DefDescriptor<TokensDef> imported3 = addSeparateTokens(tokens());
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens()
                .imported(imported1)
                .imported(imported2)
                .imported(imported3));
        List<DefDescriptor<TokensDef>> map = desc.getDef().getDeclaredImports();
        assertEquals("didn't get expected map size", 3, map.size());
    }

    public void testGetTokenDefDeclared() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().token("test1", "test1"));
        assertNotNull(desc.getDef().getTokenDef("test1"));
    }

    public void testGetTokenDefImported() throws Exception {
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("imported", "imported"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().imported(imported));
        assertNotNull(desc.getDef().getTokenDef("imported"));
    }

    public void testGetTokenDefInherited() throws Exception {
        DefDescriptor<TokensDef> inherited = addSeparateTokens(tokens().token("inherited", "inherited"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().parent(inherited));
        assertNotNull(desc.getDef().getTokenDef("inherited"));
    }

    private DefDescriptor<TokensDef> complexSetup() {
        DefDescriptor<TokensDef> importp2 = addSeparateTokens(tokens()
                .token("shared3", "shared3"));

        DefDescriptor<TokensDef> parent2 = addSeparateTokens(tokens()
                .imported(importp2)
                .token("p2a", "p2a")
                .token("p2b", "p2b")
                .token("shared1", "shared1")
                .token("shared2", "shared2"));

        DefDescriptor<TokensDef> parent1 = addSeparateTokens(tokens()
                .parent(parent2)
                .token("p1a", "p1a")
                .token("p1b", "p1b"));

        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens()
                .token("i1a", "i1a")
                .token("i1b", "i1b"));

        DefDescriptor<TokensDef> import2a = addSeparateTokens(tokens()
                .token("shared2", "shared2")
                .token("i2a-1", "i2a-1"));

        DefDescriptor<TokensDef> import2 = addSeparateTokens(tokens()
                .imported(import2a)
                .token("i2a", "i2a")
                .token("i2b", "i2b"));

        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens()
                .parent(parent1)
                .imported(import1)
                .imported(import2)
                .token("shared1", "shared1")
                .token("d1", "d1")
                .token("d2", "d2"));

        // remember, imports are reversed, declared ordered before imported
        return desc;
    }

    public void testGetDeclaredTokenNames() throws Exception {
        Set<String> names = complexSetup().getDef().getDeclaredNames();
        assertEquals("didn't get expected size", 3, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("d1", Iterables.get(names, 1));
        assertEquals("d2", Iterables.get(names, 2));
    }

    public void testGetImportedTokenNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getImportedNames());
        assertEquals("didn't get expected size", 6, names.size());
        assertEquals("i2a", Iterables.get(names, 0));
        assertEquals("i2b", Iterables.get(names, 1));
        assertEquals("shared2", Iterables.get(names, 2));
        assertEquals("i2a-1", Iterables.get(names, 3));
        assertEquals("i1a", Iterables.get(names, 4));
        assertEquals("i1b", Iterables.get(names, 5));
    }

    public void testGetInheritedTokenNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getInheritedNames());
        assertEquals("didn't get expected size", 7, names.size());
        assertEquals("p1a", Iterables.get(names, 0));
        assertEquals("p1b", Iterables.get(names, 1));
        assertEquals("p2a", Iterables.get(names, 2));
        assertEquals("p2b", Iterables.get(names, 3));
        assertEquals("shared1", Iterables.get(names, 4));
        assertEquals("shared2", Iterables.get(names, 5));
        assertEquals("shared3", Iterables.get(names, 6));
    }

    /** imported + declared */
    public void testGetOwnTokenNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getOwnNames());
        assertEquals("didn't get expected size", 9, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("d1", Iterables.get(names, 1));
        assertEquals("d2", Iterables.get(names, 2));

        assertEquals("i2a", Iterables.get(names, 3));
        assertEquals("i2b", Iterables.get(names, 4));
        assertEquals("shared2", Iterables.get(names, 5));
        assertEquals("i2a-1", Iterables.get(names, 6));
        assertEquals("i1a", Iterables.get(names, 7));
        assertEquals("i1b", Iterables.get(names, 8));
    }

    /** imported + declared + inherited */
    public void testGetAllTokenNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getAllNames());
        assertEquals("didn't get expected size", 14, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("d1", Iterables.get(names, 1));
        assertEquals("d2", Iterables.get(names, 2));

        assertEquals("i2a", Iterables.get(names, 3));
        assertEquals("i2b", Iterables.get(names, 4));
        assertEquals("shared2", Iterables.get(names, 5));
        assertEquals("i2a-1", Iterables.get(names, 6));
        assertEquals("i1a", Iterables.get(names, 7));
        assertEquals("i1b", Iterables.get(names, 8));

        assertEquals("p1a", Iterables.get(names, 9));
        assertEquals("p1b", Iterables.get(names, 10));
        assertEquals("p2a", Iterables.get(names, 11));
        assertEquals("p2b", Iterables.get(names, 12));
        assertEquals("shared3", Iterables.get(names, 13));
    }

    /** intersection of own token names (declared or imported) with inherited token names */
    public void testGetOverriddenTokenNames() throws Exception {
        Set<String> names = complexSetup().getDef().getOverriddenNames();
        assertEquals("didn't get expected size", 2, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("shared2", Iterables.get(names, 1));
    }

    /** no errors when extends refers to existent def */
    public void testValidatesGoodExtendsRef() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> child = addSeparateTokens(tokens().parent(parent));
        Aura.getDefinitionService().getDefinition(child).validateReferences();
    }

    /** errors when extends refers to nonexistent def */
    public void testValidatesBadExtendsRef() throws Exception {
        try {
            String src = "<aura:tokens extends=\"test:idontexist\"></aura:tokens>";
            Aura.getDefinitionService().getDefinition(addSeparateTokens(src)).validateReferences();
            fail("Expected validation to fail.");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No TOKENS");
        }
    }

    /** cannot extend itself */
    public void testCantExtendItself() throws Exception {
        DefDescriptor<TokensDef> extendsSelf = addSourceAutoCleanup(TokensDef.class, "");
        StringSource<?> source = (StringSource<?>) getAuraTestingUtil().getSource(extendsSelf);
        String contents = "<aura:tokens extends='%s'> </aura:tokens>";
        source.addOrUpdate(String.format(contents, extendsSelf.getDescriptorName()));
        try {
            TokensDef def = extendsSelf.getDef();
            def.validateReferences();
            fail("A tokens def should not be able to extend itself.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot extend itself");
        }
    }

    /** circular hierarchies are prevented */
    public void testCircularHierarchy() throws Exception {
        DefDescriptor<TokensDef> circular1 = addSourceAutoCleanup(TokensDef.class, "");
        DefDescriptor<TokensDef> circular2 = addSourceAutoCleanup(TokensDef.class, "");

        StringSource<?> source = (StringSource<?>) getAuraTestingUtil().getSource(circular1);
        String contents = "<aura:tokens extends='%s'><aura:token name='attr' value='1'/></aura:tokens>";
        source.addOrUpdate(String.format(contents, circular2.getDescriptorName()));

        source = (StringSource<?>) getAuraTestingUtil().getSource(circular2);
        contents = "<aura:tokens extends='%s'> </aura:tokens>";
        source.addOrUpdate(String.format(contents, circular1.getDescriptorName()));

        try {
            TokensDef def = circular2.getDef();
            def.getToken("attr");
            def.getAllNames(); // recursive
            fail("expected to throw InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "eventually extend itself");
        }
    }

    /** error thrown if extending and importing the same def */
    public void testExtendAndImportSameDef() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens());
        try {
            addSeparateTokens(tokens().parent(parent).imported(parent)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "extend and import");
        }
    }

    public void testCantImportTokensWithExtends() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens("<aura:tokens/>");
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().parent(parent));

        try {
            addSeparateTokens(tokens().imported(desc)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot be imported");
        }
    }

    public void testCantImportTokensWithProvider() throws Exception {
        DefDescriptor<TokensDef> withProvider = addSeparateTokens(tokens().descriptorProvider(
                TestTokenDescriptorProvider.REF));

        try {
            addSeparateTokens(tokens().imported(withProvider)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot be imported");
        }
    }

    /** the cross reference must be inherited or declared */
    public void testInvalidCrossRef() throws Exception {
        try {
            addSeparateTokens("<aura:tokens><aura:token name='one' value='{!notthere}'/></aura:tokens>").getDef();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, TokenValueNotFoundException.class, "was not found");
        }
    }

    /** cross references to declared tokens should not throw an error */
    public void testValidCrossRefDeclared() throws Exception {
    	Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().token("one", "one").token("two", "{!one}")))
    	.validateReferences();
    }

    /** cross references to inherited tokens should not throw an error */
    public void testValidCrossRefInherited() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> child = addSeparateTokens(tokens().parent(parent).token("myColor", "{!color}"));
        Aura.getDefinitionService().getDefinition(child).validateReferences(); // no error
    }

    /** cross references to imported tokens should not throw an error */
    public void testValidCrossRefImported() throws Exception {
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().imported(imported).token("myColor", "{!color}"));
        Aura.getDefinitionService().getDefinition(desc).validateReferences(); // no error
    }

    /** test imported tokens cross refs namespace-default token */
    public void testImportCrossRefNamespaceDefault() throws Exception {
        addNsTokens(tokens().token("color", "red"));

        // this can't work, because the imported tokens might get imported into a different namespace, and that
        // different namespace's defaults might not define a value.
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens().token("myColor", "{!color}"));
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().imported(import1));

        try {
        	Aura.getDefinitionService().getDefinition(desc).validateReferences();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, TokenValueNotFoundException.class, "was not found");
        }
    }

    public void testAppendsExtendsToDeps() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> child = addSeparateTokens(tokens().parent(parent));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();

        Aura.getDefinitionService().getDefinition(child).appendDependencies(dependencies);
        assertTrue(dependencies.contains(parent));
    }

    public void testAddsImportsToDependencies() throws Exception {
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens().token("imported", "imported"));
        DefDescriptor<TokensDef> import2 = addSeparateTokens(tokens().token("imported", "imported"));

        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().imported(import1).imported(import2));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        Aura.getDefinitionService().getDefinition(desc).appendDependencies(dependencies);
        assertTrue(dependencies.contains(import1));
        assertTrue(dependencies.contains(import2));
    }

    public void testGetDescriptorProviderAbsent() throws Exception {
        assertNull(Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens())).getDescriptorProvider());
    }

    public void testGetDescriptorProviderPresent() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        assertEquals(TestTokenDescriptorProvider.REF, Aura.getDefinitionService().getDefinition(desc).getDescriptorProvider().getQualifiedName());
    }

    public void testAddsProviderToDeps() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        Aura.getDefinitionService().getDefinition(desc).appendDependencies(dependencies);

        DefDescriptor<TokenDescriptorProviderDef> def = DefDescriptorImpl.getInstance(TestTokenDescriptorProvider.REF,
                TokenDescriptorProviderDef.class);
        assertTrue(dependencies.contains(def));
    }

    public void testGetConcreteDescriptorWithProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        assertEquals(TestTokenDescriptorProvider.DESC, Aura.getDefinitionService().getDefinition(desc).getConcreteDescriptor().getDescriptorName());
    }

    public void testGetConcreteDescriptorWithoutProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().token("color", "red"));
        assertEquals(desc.getDescriptorName(), Aura.getDefinitionService().getDefinition(desc).getConcreteDescriptor().getDescriptorName());
    }

    public void testErrorsIfProviderHasTokens() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF).token("color", "red")))
                    .getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify tokens");
        }
    }

    public void testErrorsIfProviderHasImports() throws Exception {
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens().token("imported", "imported"));
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF).imported(import1)))
                    .getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify imports");
        }
    }

    public void testErrorsIfProviderHasExtends() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("parent", "parent"));
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF).parent(parent)))
                    .getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not use 'extends'");
        }
    }

    public void testErrorsIfProviderIsNsDefault() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(addNsTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF))).
            getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify a provider");
        }
    }

    public void testGetMapProviderAbsent() throws Exception {
        assertNull(Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens())).getMapProvider());
    }

    public void testGetMapProviderPresent() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        assertEquals(TestTokenMapProvider.REF, Aura.getDefinitionService().getDefinition(desc).getMapProvider().getQualifiedName());
    }

    public void testAddsMapProviderToDeps() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        Aura.getDefinitionService().getDefinition(desc).appendDependencies(dependencies);

        DefDescriptor<TokenMapProviderDef> def = DefDescriptorImpl.getInstance(TestTokenMapProvider.REF,
                TokenMapProviderDef.class);
        assertTrue(dependencies.contains(def));
    }

    public void testErrorsIfMapProviderHasTokens() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF).token("color", "red")));
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify tokens");
        }
    }

    public void testErrorsIfMapProviderHasImports() throws Exception {
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens().token("imported", "imported"));
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF).imported(import1)));
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify imports");
        }
    }

    public void testErrorsIfMapProviderHasExtends() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("parent", "parent"));
        try {
        	Aura.getDefinitionService().getDefinition(addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF).parent(parent)));
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not use 'extends'");
        }
    }

    public void testErrorsIfMapProviderIsNsDefault() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(addNsTokens(tokens().mapProvider(TestTokenMapProvider.REF)));
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify a provider");
        }
    }
}
