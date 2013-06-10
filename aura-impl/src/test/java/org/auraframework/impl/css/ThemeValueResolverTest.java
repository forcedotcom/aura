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
package org.auraframework.impl.css;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.parser.ThemeValueResolver;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeVariableNotFoundException;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableMap;

/**
 * Unit tests for {@link ThemeValueResolver}.
 */
public class ThemeValueResolverTest extends AuraImplTestCase {
    private ThemeValueResolver resolver;

    public ThemeValueResolverTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        resolver = new ThemeValueResolver();
    }

    public void testQualified() throws QuickFixException {
        assertThat(resolver.resolve("test.fakeTheme.color"), is("#ffcc00"));
    }

    public void testSingleQuoted() throws QuickFixException {
        assertThat(resolver.resolve("'test.fakeTheme.color'"), is("#ffcc00"));
    }

    public void testDoubleQuoted() throws QuickFixException {
        assertThat(resolver.resolve("\"test.fakeTheme.color\""), is("#ffcc00"));
    }

    public void testQualifiedAbsent() throws QuickFixException {
        try {
            resolver.resolve("does.not.exist");
            fail("Did not expect to find the theme definition.");
        } catch (DefinitionNotFoundException e) {
            // expected
        }
    }

    public void testSimple() throws QuickFixException {
        ThemeDef def = vendor.makeThemeDef(ImmutableMap.of("color", "red"));
        String resolved = new ThemeValueResolver(def).resolve("color");
        assertThat(resolved, is("red"));
    }

    public void testSimpleAbsent() throws QuickFixException {
        ThemeDef def = vendor.makeThemeDef(ImmutableMap.of("color", "red"));
        try {
            new ThemeValueResolver(def).resolve("margin");
            fail("Did not expect to resolve the non-existant theme variable.");
        } catch (ThemeVariableNotFoundException e) {
            // expected
        }
    }

    public void testWeird() throws QuickFixException {
        ThemeDef def = vendor.makeThemeDef(ImmutableMap.of("color", "red"));
        try {
            new ThemeValueResolver(def).resolve(".color");
            fail("Did not expect to resolve the non-existant theme variable.");
        } catch (ThemeVariableNotFoundException e) {
            // expected
        }
    }

    public void testResolveToDescriptor() {
        Optional<DefDescriptor<ThemeDef>> resolved = resolver.resolveToDescriptor("test.fakeTheme.color");
        DefDescriptor<ThemeDef> expected = DefDescriptorImpl.getInstance("test:fakeTheme", ThemeDef.class);
        assertThat(expected, is(resolved.get()));
    }

    public void todotestOverrides() {
        // TODONM write this test when extensions are available.
    }

}