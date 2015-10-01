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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDescriptorProvider;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.java.provider.TestTokenDescriptorProvider;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

public class JavaTokenProviderDefTest extends StyleTestCase {
    public JavaTokenProviderDefTest(String name) {
        super(name);
    }

    public void testProviderBasic() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        DefDescriptor<TokensDef> concrete = desc.getDef().getConcreteDescriptor();
        DefDescriptor<TokensDef> expected = DefDescriptorImpl.getInstance(TestTokenDescriptorProvider.DESC, TokensDef.class);
        assertEquals(expected, concrete);
    }

    @Provider
    public static final class P1 implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("tokenProviderTest:javaProviderTest2", TokensDef.class);
        }
    }

    @Provider
    public static final class P2 implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("tokenProviderTest:javaProviderTest3", TokensDef.class);
        }
    }

    public void testMultipleLevelProvider() throws Exception {
        DefDescriptor<TokensDef> initial = DefDescriptorImpl.getInstance("tokenProviderTest:javaProviderTest1",
                TokensDef.class);

        DefDescriptor<TokensDef> expected = DefDescriptorImpl.getInstance("tokenProviderTest:javaProviderTest3",
                TokensDef.class);

        DefDescriptor<TokensDef> concrete = initial.getDef().getConcreteDescriptor();

        assertEquals(expected, concrete);
    }

    @Provider
    public static final class ProviderThrowsOnInstantiate implements TokenDescriptorProvider {
        public ProviderThrowsOnInstantiate() {
            throw new RuntimeException("error");
        }

        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return null;
        }
    }

    public void testProviderThrowsDuringInstantiation() throws Exception {
        try {
            addSeparateTokens(tokens().descriptorProvider("java://" + ProviderThrowsOnInstantiate.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Failed to instantiate");
        }
    }

    @Provider
    public static final class ProviderThrowsOnProvide implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            throw new InvalidDefinitionException("provider error", null);
        }
    }

    public void testProviderThrowsQFE() throws Exception {
        try {
            addSeparateTokens(tokens().descriptorProvider("java://" + ProviderThrowsOnProvide.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "provider error");
        }
    }

    @Provider
    public static final class ProviderConstructorArg implements TokenDescriptorProvider {
        public ProviderConstructorArg(String s) {
        }

        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return null;
        }
    }

    public void testProviderWithoutNoArgConstructor() throws Exception {
        try {
            addSeparateTokens(tokens().descriptorProvider("java://" + ProviderConstructorArg.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Cannot instantiate");
        }
    }

    @Provider
    public static final class ProviderPrivateConstructor implements TokenDescriptorProvider {
        private ProviderPrivateConstructor() {
        }

        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return null;
        }
    }

    public void testProviderWithPrivateConstructor() throws Exception {
        try {
            addSeparateTokens(tokens().descriptorProvider("java://" + ProviderPrivateConstructor.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Constructor is inaccessible");
        }
    }

    @Provider
    public static final class ProviderNonexistent implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("s:s", TokensDef.class);
        }
    }

    public void testProviderReturnsNonexistentDef() throws Exception {
        try {
            addSeparateTokens(tokens().descriptorProvider("java://" + ProviderNonexistent.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No TOKENS");
        }
    }

    @Provider
    public static final class MissingInterface {
    }

    public void testProviderMissingInterface() throws Exception {
        try {
            addSeparateTokens(tokens().descriptorProvider("java://" + MissingInterface.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Provider must implement");
        }
    }

    public static final class MissingAnnotation implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("test:fakeTokens", TokensDef.class);
        }
    }

    public void testProviderMissingAnnotation() throws Exception {
        try {
            addSeparateTokens(tokens().descriptorProvider("java://" + MissingAnnotation.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "annotation is required");
        }
    }
}
