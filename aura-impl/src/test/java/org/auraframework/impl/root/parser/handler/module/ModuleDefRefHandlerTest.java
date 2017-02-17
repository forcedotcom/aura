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
package org.auraframework.impl.root.parser.handler.module;

import javax.inject.Inject;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.root.parser.handler.ComponentDefHandler;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.junit.Test;

/**
 * ModuleDefRefHandler tests.
 * All functionality in BaseDefRefHandler is exhausted in ComponentDefRefHandlerTest
 */
public class ModuleDefRefHandlerTest extends AuraImplTestCase {

    @Inject
    private DefinitionParserAdapter definitionParserAdapter;

    @Test
    public void getHandledTag() throws Exception {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                desc,"<test:test />", "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(source.getHashingReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader, true, definitionService, contextService,
                configAdapter, definitionParserAdapter);
        ModuleDefRefHandler handler = new ModuleDefRefHandler<>(cdh, xmlReader, source, true, definitionService, configAdapter, definitionParserAdapter);
        assertEquals("module reference", handler.getHandledTag());
    }

}
