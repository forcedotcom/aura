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

import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokensImportDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.TokensImportDefHandler;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

import com.google.common.collect.Sets;

public class TokensImportImplTest extends StyleTestCase {
    public TokensImportImplTest(String name) {
        super(name);
    }

    private TokensImportDef source(String src) throws Exception {
        DefDescriptor<TokensImportDef> desc = definitionService.getDefDescriptor("test", TokensImportDef.class);
        StringSource<TokensImportDef> ss = new StringSource<>(desc, src, "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(ss.getHashingReader());
        xmlReader.next();
        TokensImportDefHandler<TokensDef> handler = new TokensImportDefHandler<>(null, xmlReader, ss);
        return handler.getElement();
    }

    public void testEqualsWhenSame() throws Exception {
        TokensImportDef def1 = source("<aura:import name='blah:blah'/>");
        assertEquals(def1, def1);
    }

    public void testNotEquals() throws Exception {
        TokensImportDef def1 = source("<aura:import name='blah:blah'/>");
        TokensImportDef def2 = source("<aura:import name='blah2:blah2'/>");
        assertFalse(def1.equals(def2));
        assertFalse(def2.equals(def1));
        assertFalse(def2.equals(null));
    }

    public void testAppendDependencies() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens());
        TokensImportDef def = source(String.format("<aura:import name='%s'/>", desc.getDescriptorName()));

        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        def.appendDependencies(deps);
        assertTrue(deps.contains(desc));
    }

    public void testInvalidReference() throws Exception {
        try {
            TokensImportDef def = source("<aura:import name='blah:blah'/>");
            def.validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No TOKENS");
        }
    }
}
