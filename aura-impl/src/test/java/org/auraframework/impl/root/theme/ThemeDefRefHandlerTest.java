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
package org.auraframework.impl.root.theme;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDefRef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.ThemeDefRefHandler;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

public class ThemeDefRefHandlerTest extends StyleTestCase {

    public ThemeDefRefHandlerTest(String name) {
        super(name);
    }

    private ThemeDefRef source(String src) throws Exception {
        DefDescriptor<ThemeDefRef> desc = Aura.getDefinitionService().getDefDescriptor("test", ThemeDefRef.class);
        StringSource<ThemeDefRef> ss = new StringSource<>(desc, src, "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.getInstance().createXMLStreamReader(ss.getHashingReader());
        xmlReader.next();
        ThemeDefRefHandler<ThemeDef> handler = new ThemeDefRefHandler<>(null, xmlReader, ss);
        return handler.getElement();
    }

    public void testThemeDescriptor() throws Exception {
        ThemeDefRef def = source("<aura:importTheme name='test:theme'/>");
        DefDescriptor<ThemeDef> desc = DefDescriptorImpl.getInstance("test:theme", ThemeDef.class);
        assertEquals(desc, def.getThemeDescriptor());
    }

    public void testDescription() throws Exception {
        ThemeDefRef def = source("<aura:importTheme name='test:theme' description='test'/>");
        assertEquals("test", def.getDescription());
    }

    public void testInvalidChild() throws Exception {
        try {
            source("<aura:importTheme name='test:theme'><ui:button></aura:importTheme>");
            fail("Should have thrown an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No children");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:importTheme name='test:theme'>blah</aura:importTheme>");
            fail("Should have thrown an exception");
        } catch (AuraRuntimeException e) {
            checkExceptionContains(e, AuraRuntimeException.class, "No literal text");
        }
    }

    public void testMissingName() throws Exception {
        try {
            source("<aura:importTheme name=''/>");
            fail("Should have thrown an exception");
        } catch (AuraRuntimeException e) {
            checkExceptionContains(e, AuraRuntimeException.class, "Missing required attribute 'name'");
        }
    }
}
