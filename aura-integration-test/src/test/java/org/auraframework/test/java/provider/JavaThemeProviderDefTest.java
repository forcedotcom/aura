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
package org.auraframework.test.java.provider;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDescriptorProvider;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.java.provider.TestThemeDescriptorProvider;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Tests {@link JavaThemeDescriptorProviderDef}.
 */
public class JavaThemeProviderDefTest extends StyleTestCase {

    public JavaThemeProviderDefTest(String name) {
        super(name);
    }

    public void testProviderBasic() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF));
        DefDescriptor<ThemeDef> concrete = theme.getDef().getConcreteDescriptor();
        DefDescriptor<ThemeDef> expected = DefDescriptorImpl.getInstance(TestThemeDescriptorProvider.DESC, ThemeDef.class);
        assertEquals(expected, concrete);
    }

    @Provider
    public static final class P1 implements ThemeDescriptorProvider {
        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("themeProviderTest:javaProviderTest2", ThemeDef.class);
        }
    }

    @Provider
    public static final class P2 implements ThemeDescriptorProvider {
        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("themeProviderTest:javaProviderTest3", ThemeDef.class);
        }
    }

    public void testMultipleLevelProvider() throws Exception {
        DefDescriptor<ThemeDef> initial = DefDescriptorImpl.getInstance("themeProviderTest:javaProviderTest1",
                ThemeDef.class);

        DefDescriptor<ThemeDef> expected = DefDescriptorImpl.getInstance("themeProviderTest:javaProviderTest3",
                ThemeDef.class);

        DefDescriptor<ThemeDef> concrete = initial.getDef().getConcreteDescriptor();

        assertEquals(expected, concrete);
    }

    @Provider
    public static final class ProviderThrowsOnInstantiate implements ThemeDescriptorProvider {
        public ProviderThrowsOnInstantiate() {
            throw new RuntimeException("error");
        }

        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return null;
        }
    }

    public void testProviderThrowsDuringInstantiation() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider("java://" + ProviderThrowsOnInstantiate.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Failed to instantiate");
        }
    }

    @Provider
    public static final class ProviderThrowsOnProvide implements ThemeDescriptorProvider {
        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            throw new InvalidDefinitionException("provider error", null);
        }
    }

    public void testProviderThrowsQFE() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider("java://" + ProviderThrowsOnProvide.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "provider error");
        }
    }

    @Provider
    public static final class ProviderConstructorArg implements ThemeDescriptorProvider {
        public ProviderConstructorArg(String s) {
        }

        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return null;
        }
    }

    public void testProviderWithoutNoArgConstructor() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider("java://" + ProviderConstructorArg.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Cannot instantiate");
        }
    }

    @Provider
    public static final class ProviderPrivateConstructor implements ThemeDescriptorProvider {
        private ProviderPrivateConstructor() {
        }

        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return null;
        }
    }

    public void testProviderWithPrivateConstructor() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider("java://" + ProviderPrivateConstructor.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Constructor is inaccessible");
        }
    }

    @Provider
    public static final class ProviderNonexistent implements ThemeDescriptorProvider {
        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("s:s", ThemeDef.class);
        }
    }

    public void testProviderReturnsNonexistentTheme() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider("java://" + ProviderNonexistent.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No THEME");
        }
    }

    @Provider
    public static final class MissingInterface {
    }

    public void testProviderMissingInterface() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider("java://" + MissingInterface.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Provider must implement");
        }
    }

    public static final class MissingAnnotation implements ThemeDescriptorProvider {
        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("test:fakeTheme", ThemeDef.class);
        }
    }

    public void testProviderMissingAnnotation() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider("java://" + MissingAnnotation.class.getName()))
            .getDef().getConcreteDescriptor();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "annotation is required");
        }
    }
}
