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
package org.auraframework.integration.test.root.parser;

import java.security.SecureRandom;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Location;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

/**
 * A base class that does some simple generic tests that should pass for all XML parsers.
 */
public abstract class XMLParserTest<T extends RootDefinition> extends AuraImplTestCase {

    protected abstract XMLParser<T> getParser();

    protected abstract Class<T> getDefinitionClass();

    private SecureRandom random = new SecureRandom();

    <D extends Definition> DefDescriptor<D> makeUniqueMarkupDescriptor(Class<D> clazz) {
        String namespace = "myreallyuniquenamespace"+random.nextLong();
        String name = "myreallyunique"+random.nextLong();
        return new DefDescriptorImpl<D>("markup", namespace, name, clazz);
    }

    <D extends Definition> TextSource<D> makeTextSource(DefDescriptor<D> descriptor, String contents, Format format) {
        return new StringSource<D>(descriptor, contents, descriptor.getName()+".randomExtension", format);
    }

    @Test
    public void testParseNull() throws Exception {
        DefDescriptor<T> descriptor = makeUniqueMarkupDescriptor(getDefinitionClass());
        Throwable expected = null;

        try {
            getParser().getDefinition(descriptor, null);
        } catch (Throwable t) {
            expected = t;
        }
        // Do not test anything other than we get an exception. Specifically never require it to
        // be a particular type.
        assertNotNull("Should have failed to parse with some exception when source is null", expected);
    }

    @Test
    public void testParseInvalid() throws Exception {
        DefDescriptor<T> descriptor = makeUniqueMarkupDescriptor(getDefinitionClass());
        TextSource<T> source = makeTextSource(descriptor, "\n\n   invalid.", Format.XML);
        InvalidDefinitionException expected = null;
        T def = getParser().getDefinition(descriptor, source);

        try {
            def.validateDefinition();
        } catch (InvalidDefinitionException e) {
            expected = e;
        }
        Location location = expected.getLocation();
        assertTrue("Wrong filename.", location.getFileName().endsWith(descriptor.getName()+".randomExtension"));
        assertEquals(3, location.getLine());
        assertEquals(4, location.getColumn());
    }

    @Test
    public void testParseFragment() throws Exception {
        DefDescriptor<T> descriptor = makeUniqueMarkupDescriptor(getDefinitionClass());
        TextSource<T> source = makeTextSource(descriptor, "<aura:parent />.", Format.XML);
        InvalidDefinitionException expected = null;

        try {
            T def = getParser().getDefinition(descriptor, source);
            def.validateDefinition();
        } catch (InvalidDefinitionException e) {
            expected = e;
        }
        Location location = expected.getLocation();
        assertTrue("Wrong filename.", location.getFileName().endsWith(descriptor.getName()+".randomExtension"));
        assertEquals(1, location.getLine());
        assertEquals(16, location.getColumn());
    }
}
