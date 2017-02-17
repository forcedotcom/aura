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
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokensImportDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.root.parser.handler.TokensImportDefHandler;
import org.auraframework.impl.source.StringSource;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;

public class TokensImportDefHandlerTest extends StyleTestCase {
    @Inject
    DefinitionService definitionService;

    @Inject
    private DefinitionParserAdapter definitionParserAdapter;
    
    private TokensImportDef source(String src) throws Exception {
        DefDescriptor<TokensImportDef> desc = definitionService.getDefDescriptor("test", TokensImportDef.class);
        StringSource<TokensImportDef> ss = new StringSource<>(desc, src, "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(ss.getHashingReader());
        xmlReader.next();
        TokensImportDefHandler<TokensDef> handler = new TokensImportDefHandler<>(null, xmlReader, ss, true,
                definitionService, configAdapter, definitionParserAdapter);
        return handler.getElement();
    }

    @Test
    public void testDescriptor() throws Exception {
        TokensImportDef def = source("<aura:import name='test:tokens'/>");
        DefDescriptor<TokensDef> desc = definitionService.getDefDescriptor("test:tokens", TokensDef.class);
        assertEquals(desc, def.getImportDescriptor());
    }

    @Test
    public void testDescription() throws Exception {
        TokensImportDef def = source("<aura:import name='test:tokens' description='test'/>");
        assertEquals("test", def.getDescription());
    }

    @Test
    public void testInvalidChild() throws Exception {
        try {
            source("<aura:import name='test:tokens'><ui:button></aura:import>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No children");
        }
    }

    @Test
    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:import name='test:tokens'>blah</aura:import>");
            fail("Should have thrown an exception");
        } catch (AuraRuntimeException e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No literal text");
        }
    }

    @Test
    public void testMissingName() throws Exception {
        try {
            source("<aura:import name=''/>");
            fail("Should have thrown an exception");
        } catch (AuraRuntimeException e) {
            checkExceptionContains(e, AuraRuntimeException.class, "Missing required attribute 'name'");
        }
    }
}
