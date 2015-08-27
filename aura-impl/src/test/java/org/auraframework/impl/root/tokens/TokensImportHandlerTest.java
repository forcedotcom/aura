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
package org.auraframework.impl.root.tokens;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokensImport;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.TokensImportHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.AuraRuntimeException;

public class TokensImportHandlerTest extends StyleTestCase {

    public TokensImportHandlerTest(String name) {
        super(name);
    }

    private TokensImport source(String src) throws Exception {
        DefDescriptor<TokensImport> desc = Aura.getDefinitionService().getDefDescriptor("test", TokensImport.class);
        StringSource<TokensImport> ss = new StringSource<>(desc, src, "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(ss.getHashingReader());
        xmlReader.next();
        TokensImportHandler<TokensDef> handler = new TokensImportHandler<>(null, xmlReader, ss);
        return handler.getElement();
    }

    public void testDescriptor() throws Exception {
        TokensImport def = source("<aura:import name='test:tokens'/>");
        DefDescriptor<TokensDef> desc = DefDescriptorImpl.getInstance("test:tokens", TokensDef.class);
        assertEquals(desc, def.getImportDescriptor());
    }

    public void testDescription() throws Exception {
        TokensImport def = source("<aura:import name='test:tokens' description='test'/>");
        assertEquals("test", def.getDescription());
    }

    public void testInvalidChild() throws Exception {
        try {
            source("<aura:import name='test:tokens'><ui:button></aura:import>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No children");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:import name='test:tokens'>blah</aura:import>");
            fail("Should have thrown an exception");
        } catch (AuraRuntimeException e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No literal text");
        }
    }

    public void testMissingName() throws Exception {
        try {
            source("<aura:import name=''/>");
            fail("Should have thrown an exception");
        } catch (AuraRuntimeException e) {
            checkExceptionContains(e, AuraRuntimeException.class, "Missing required attribute 'name'");
        }
    }
}
