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
package org.auraframework.impl.root.parser.handler;

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;

import javax.inject.Inject;
import javax.xml.stream.XMLStreamReader;

/**
 * Test for {@link ContainerTagHandler}.
 */
public class ContainerTagHandlerTest extends AuraImplTestCase {
    XMLStreamReader xmlReader;

    @Inject
    private DefinitionParserAdapter definitionParserAdapter;

    @Test
    public void testGetDefRefHandler() throws Exception {
        // 1. Verify that specifying invalid load level in a component def ref,
        // throws Exception.
        try {
            createDefRefHandler("<fake:component aura:load='foo'/>");
            fail("Should not be able to specify an invalid load value.");
        } catch (AuraRuntimeException expected) {
            assertTrue("unexpected message " + expected.getMessage(),
                    expected.getMessage().contains("Invalid value 'foo' specified for 'aura:load' attribute"));
        }
    }

    /**
     * Utility method to create a DefRefHandler for a given markup.
     */
    private ParentedTagHandler<? extends DefinitionReference, ?> createDefRefHandler(String markup) throws Exception {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(desc, markup, "myID", Format.XML);
        xmlReader = XMLParser.createXMLStreamReader(source.getHashingReader());
        xmlReader.next();
        // Assume we found the markup in a component, create a
        // ComponentDefHandler to represent that
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader, true, definitionService,
                contextService, configAdapter, definitionParserAdapter);
        // Try to create a DefRefHandler which will inturn call
        // ContainerTagHandler.getDefRefHandler()
        return cdh.getDefRefHandler(cdh);
    }
}
