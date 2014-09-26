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

import java.util.Set;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDefRef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.ThemeDefRefHandler;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

import com.google.common.collect.Sets;

public class ThemeDefRefImplTest extends StyleTestCase {
    public ThemeDefRefImplTest(String name) {
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

    public void testEqualsWhenSame() throws Exception {
        ThemeDefRef def1 = source("<aura:importTheme name='blah:blah'/>");
        assertEquals(def1, def1);
    }

    public void testNotEquals() throws Exception {
        ThemeDefRef def1 = source("<aura:importTheme name='blah:blah'/>");
        ThemeDefRef def2 = source("<aura:importTheme name='blah2:blah2'/>");
        assertFalse(def1.equals(def2));
        assertFalse(def2.equals(def1));
        assertFalse(def2.equals(null));
    }

    public void testAppendDependencies() throws Exception {
        DefDescriptor<ThemeDef> desc = addSeparateTheme(theme());
        ThemeDefRef def = source(String.format("<aura:importTheme name='%s'/>", desc.getDescriptorName()));

        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        def.appendDependencies(deps);
        assertTrue(deps.contains(desc));
    }

    public void testInvalidReference() throws Exception {
        try {
            ThemeDefRef def = source("<aura:importTheme name='blah:blah'/>");
            def.validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No THEME");
        }
    }
}
