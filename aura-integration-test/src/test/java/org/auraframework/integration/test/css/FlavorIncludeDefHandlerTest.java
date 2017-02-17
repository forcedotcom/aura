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

import javax.inject.Inject;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.root.parser.handler.FlavorIncludeDefHandler;
import org.auraframework.impl.root.parser.handler.FlavorsDefHandler;
import org.auraframework.impl.source.StringSource;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public class FlavorIncludeDefHandlerTest extends StyleTestCase {
    @Inject
    private DefinitionService definitionService;

    @Inject
    private DefinitionParserAdapter definitionParserAdapter;

    @Test
    public void testReadsSourceAttribute() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef();
        addStandardFlavor(cmp, ".THIS--test{}");
        String fmt = String.format("<aura:include source='foo:flavors'/>", cmp.getDescriptorName());
        FlavorIncludeDef def = source(fmt);
        assertEquals("foo:flavors", def.getSource());
    }

    @Test
    public void testDescription() throws Exception {
        addStandardFlavor(addComponentDef(), ".THIS--test{}");
        FlavorIncludeDef def = source("<aura:include source='foo:flavors' description='testdesc'/>");
        assertEquals("testdesc", def.getDescription());
    }

    @Test
    public void testInvalidChild() throws Exception {
        try {
            source("<aura:include source='foo:flavors'><ui:button></aura:include>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No children");
        }
    }

    @Test
    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:include source='foo:flavors'>blah</aura:include>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No literal text");
        }
    }

    @Test
    public void testErrorsIfMissingSource() throws Exception {
        try {
            source("<aura:include/>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute");
        }
    }

    @Test
    public void testErrorsIfEmptySource() throws Exception {
        try {
            source("<aura:include source=''/>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute");
        }
    }

    private FlavorIncludeDef source(String src) throws Exception {
        DefDescriptor<FlavorsDef> parentDesc = definitionService.getDefDescriptor("test:tmp",
                FlavorsDef.class);
        StringSource<FlavorsDef> parentSource = new StringSource<>(parentDesc, "<aura:flavors/>", "myID", Format.XML);
        XMLStreamReader parentReader = XMLParser.createXMLStreamReader(parentSource.getHashingReader());
        parentReader.next();
        FlavorsDefHandler parent = new FlavorsDefHandler(parentDesc, parentSource, parentReader, true, definitionService,
                configAdapter, definitionParserAdapter);

        DefDescriptor<FlavorIncludeDef> desc = definitionService.getDefDescriptor("test", FlavorIncludeDef.class);
        StringSource<FlavorIncludeDef> ss = new StringSource<>(desc, src, "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(ss.getHashingReader());
        xmlReader.next();
        FlavorIncludeDefHandler<FlavorsDef> handler = new FlavorIncludeDefHandler<>(parent, xmlReader, ss, true,
                definitionService, configAdapter, definitionParserAdapter);
        return handler.getElement();
    }
}
