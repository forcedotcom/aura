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

import java.util.Set;

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
import org.junit.Test;

import com.google.common.collect.Sets;

public class TokensImportImplTest extends StyleTestCase {
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
    public void testEqualsWhenSame() throws Exception {
        TokensImportDef def1 = source("<aura:import name='blah:blah'/>");
        assertEquals(def1, def1);
    }

    @Test
    public void testNotEquals() throws Exception {
        TokensImportDef def1 = source("<aura:import name='blah:blah'/>");
        TokensImportDef def2 = source("<aura:import name='blah2:blah2'/>");
        assertFalse(def1.equals(def2));
        assertFalse(def2.equals(def1));
        assertFalse(def2.equals(null));
    }

    @Test
    public void testAppendDependencies() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens());
        TokensImportDef def = source(String.format("<aura:import name='%s'/>", desc.getDescriptorName()));

        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        def.appendDependencies(deps);
        assertTrue(deps.contains(desc));
    }
}
