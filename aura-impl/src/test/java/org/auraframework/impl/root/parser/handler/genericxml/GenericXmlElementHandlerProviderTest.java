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

package org.auraframework.impl.root.parser.handler.genericxml;

import com.google.common.collect.Sets;
import org.auraframework.def.genericxml.GenericXmlCapableDef;
import org.auraframework.def.genericxml.GenericXmlElement;
import org.auraframework.def.genericxml.RootLevelGenericXmlValidator;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser;
import org.junit.Test;

import javax.annotation.Nonnull;
import javax.xml.stream.XMLStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.util.Collections;
import java.util.Set;

/**
 * Tests for GenericXmlDefHandlerProvider
 */
public class GenericXmlElementHandlerProviderTest extends AuraImplTestCase {

    @Test
    public void testProviderHandlesTag() throws Exception {
        RootLevelGenericXmlValidator validator1 = new TestValidator("test:validator1");
        RootLevelGenericXmlValidator validator2 = new TestValidator("test:validator2", true);
        Set<RootLevelGenericXmlValidator> validators = Sets.newHashSet(validator1, validator2);

        GenericXmlElementHandlerProvider provider = new GenericXmlElementHandlerProvider(validators);

        assertTrue("Expected provider to handle tag", provider.handlesTag(TestGenericXmlCapableDef.class, "test:validator1", false));
        assertTrue("Expected provider to handle tag", provider.handlesTag(TestGenericXmlCapableDef.class, "test:validator1", true));

        assertFalse("Provider should not handle tag", provider.handlesTag(TestGenericXmlCapableDef.class, "DoesNotExist", false));
        assertFalse("Provider should not handle tag", provider.handlesTag(TestGenericXmlCapableDef2.class, "test:validator1", false));

        assertTrue("Expected provider to handle internal NS", provider.handlesTag(TestGenericXmlCapableDef.class, "test:validator2", true));
        assertFalse("Expected provider to reject non internal NS", provider.handlesTag(TestGenericXmlCapableDef.class, "test:validator2", false));
    }

    @Test
    public void testProviderReturnHandler() throws Exception {
        RootLevelGenericXmlValidator validator1 = new TestValidator("test:validator1");
        Set<RootLevelGenericXmlValidator> validators = Sets.newHashSet(validator1);

        GenericXmlElementHandlerProvider provider = new GenericXmlElementHandlerProvider(validators);

        GenericXmlElementHandler handler = getHandler(provider, TestGenericXmlCapableDef.class, "test:validator1", false);
        assertNotNull("Expected a handler for a valid tag", handler);

        handler = getHandler(provider, TestGenericXmlCapableDef.class, "test:NoValidator", false);
        assertNull("No handler should have been provider", handler);
    }

    private GenericXmlElementHandler getHandler(GenericXmlElementHandlerProvider provider, Class<? extends GenericXmlCapableDef> curentDefinition,
                                                String tag, boolean isInternalNamespace) throws Exception {
        String xml = String.format("<%s/>", tag);
        Reader stringReader = new StringReader(xml);
        XMLStreamReader reader = XMLParser.createXMLStreamReader(stringReader);
        reader.next();
        StringSource<?> source = new StringSource<>(
                null,
                xml,
                "myID", Parser.Format.XML);
        return provider.getHandler(reader, source, curentDefinition, tag, isInternalNamespace);
    }

    private class TestValidator extends RootLevelGenericXmlValidator {
        private boolean requiresInternalNS;

        public TestValidator(String tag) {
            this(tag, false);
        }

        public TestValidator(String tag, boolean requiresInternalNS) {
            super(tag, TestGenericXmlCapableDef.class);
            this.requiresInternalNS = requiresInternalNS;
        }

        @Override
        public boolean allowsTextLiteral() {
            return false;
        }

        @Override
        public boolean requiresInternalNamespace() {
            return requiresInternalNS;
        }

        @Nonnull
        @Override
        public Set<String> getAllowedAttributes(boolean isInternalNs) {
            return Collections.emptySet();
        }
    }

    private class TestGenericXmlCapableDef implements GenericXmlCapableDef {

        @Nonnull
        @Override
        public Set<GenericXmlElement> getGenericTags() {
            return null;
        }

        @Nonnull
        @Override
        public Set<GenericXmlElement> getGenericTags(@SuppressWarnings("rawtypes") Class implementingDef) {
            return null;
        }
    }

    private class TestGenericXmlCapableDef2 implements GenericXmlCapableDef {

        @Nonnull
        @Override
        public Set<GenericXmlElement> getGenericTags() {
            return null;
        }

        @Nonnull
        @Override
        public Set<GenericXmlElement> getGenericTags(@SuppressWarnings("rawtypes") Class implementingDef) {
            return null;
        }
    }
}
