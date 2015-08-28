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
package org.auraframework.integration.test.css.flavor;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.FlavorAssortmentDefHandler;
import org.auraframework.impl.root.parser.handler.FlavorIncludeDefHandler;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class FlavorIncludeDefHandlerTest extends StyleTestCase {
    public FlavorIncludeDefHandlerTest(String name) {
        super(name);
    }

    public void testReadsSourceAttribute() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef();
        addStandardFlavor(cmp, ".THIS--test{}");
        String fmt = String.format("<aura:use source='foo:flavors'/>", cmp.getDescriptorName());
        FlavorIncludeDef def = source(fmt);
        assertEquals("foo:flavors", def.getSource());
    }

    public void testDescription() throws Exception {
        addStandardFlavor(addComponentDef(), ".THIS--test{}");
        FlavorIncludeDef def = source("<aura:use source='foo:flavors' description='testdesc'/>");
        assertEquals("testdesc", def.getDescription());
    }

    public void testInvalidChild() throws Exception {
        try {
            source("<aura:use source='foo:flavors'><ui:button></aura:use>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No children");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:use source='foo:flavors'>blah</aura:use>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No literal text");
        }
    }

    public void testErrorsIfMissingSource() throws Exception {
        try {
            source("<aura:use/>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute");
        }
    }

    public void testErrorsIfEmptySource() throws Exception {
        try {
            source("<aura:use source=''/>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute");
        }
    }

    private FlavorIncludeDef source(String src) throws Exception {
        DefDescriptor<FlavorAssortmentDef> parentDesc = Aura.getDefinitionService().getDefDescriptor("test:tmp",
                FlavorAssortmentDef.class);
        StringSource<FlavorAssortmentDef> parentSource = new StringSource<>(parentDesc, "<aura:flavors/>", "myID", Format.XML);
        XMLStreamReader parentReader = XMLParser.createXMLStreamReader(parentSource.getHashingReader());
        parentReader.next();
        FlavorAssortmentDefHandler parent = new FlavorAssortmentDefHandler(parentDesc, parentSource, parentReader);

        DefDescriptor<FlavorIncludeDef> desc = Aura.getDefinitionService().getDefDescriptor("test", FlavorIncludeDef.class);
        StringSource<FlavorIncludeDef> ss = new StringSource<>(desc, src, "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(ss.getHashingReader());
        xmlReader.next();
        FlavorIncludeDefHandler<FlavorAssortmentDef> handler = new FlavorIncludeDefHandler<>(parent, xmlReader, ss);
        return handler.getElement();
    }
}
