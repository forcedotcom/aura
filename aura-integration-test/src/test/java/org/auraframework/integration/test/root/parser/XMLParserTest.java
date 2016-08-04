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
package org.auraframework.integration.test.root.parser;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.root.parser.ComponentXMLParser;
import org.auraframework.impl.root.parser.EventXMLParser;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.source.file.FileSource;
import org.auraframework.system.Location;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

import javax.inject.Inject;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Map;

public class XMLParserTest extends AuraImplTestCase {

    private DefDescriptor<ComponentDef> descriptor;
    private ComponentDef def;

    @Inject
    private ComponentXMLParser componentXMLParser;

    @Inject
    private EventXMLParser eventXMLParser;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        try {
            descriptor = definitionService.getDefDescriptor("test:parser", ComponentDef.class);
            Source<ComponentDef> source = getSource(descriptor);
            def = componentXMLParser.parse(descriptor, source);
        } catch (Exception e) {
            tearDown();
            throw e;
        }
    }

    @Test
    public void testParseDescriptor() throws Exception {
        assertEquals("Unexpected Descriptor", descriptor, def.getDescriptor());
    }

    @Test
    public void testParseInvalid() throws Exception {
        descriptor = definitionService.getDefDescriptor("test:parserInvalid", ComponentDef.class);
        Source<ComponentDef> source = getSource(descriptor);
        ComponentDef cd = componentXMLParser.parse(descriptor, source);
        try {
            cd.validateDefinition();
            fail("Parsing invalid source should throw exception");
        } catch (InvalidDefinitionException e) {
            Location location = e.getLocation();
            assertTrue("Wrong filename.", location.getFileName().endsWith("parserInvalid.cmp"));
            assertEquals(19, location.getLine());
            assertEquals(5, location.getColumn());
        }
    }

    @Test
    public void testParseFragment() throws Exception {
        descriptor = definitionService.getDefDescriptor("test:parserFragment", ComponentDef.class);
        Source<ComponentDef> source = getSource(descriptor);
        ComponentDef cd = componentXMLParser.parse(descriptor, source);
        try {
            cd.validateDefinition();
            fail("Parsing invalid source should throw exception");
        } catch (AuraException e) {
            Location location = e.getLocation();
            assertTrue("Wrong filename.", location.getFileName().endsWith("parserFragment.cmp"));
            checkExceptionContains(e, InvalidDefinitionException.class,
                    "Expected start tag <aura:component> but found aura:parent");
            assertEquals(18, location.getLine());
        }
    }

    @Test
    public void testParseNonexistent() throws Exception {
        
        // Cannot use Mockito on JDK7 because the File class has been changed to directly access File.path data member
        File tmpFile = new File("") {
            @Override
            public String getPath() {
                return "";
            }

            @Override
            public String getCanonicalPath() throws IOException {
                return "";
            }

            @Override
            public boolean exists() {
                return true;
            }

            @Override
            public long lastModified() {
                return 0L;
            }

            private static final long serialVersionUID = 1L;
        };
        
        Source<ComponentDef> source = new FileSource<>(descriptor, tmpFile, Format.XML);
        try {
            componentXMLParser.parse(null, source);
            fail("Parsing nonexistent source should throw exception");
        } catch (AuraUnhandledException e) {
            assertEquals(FileNotFoundException.class, e.getCause().getCause().getClass());
        }
    }

    @Test
    public void testParseNull() throws Exception {
        descriptor = definitionService.getDefDescriptor("test:parserNonexistent", ComponentDef.class);
        Source<ComponentDef> source = null;
        try {
            componentXMLParser.parse(descriptor, source);
            fail("Parsing null source should throw exception");
        } catch (AuraUnhandledException e) {
            assertEquals(NullPointerException.class, e.getCause().getClass());
            // good!
        }
    }

    @Test
    public void testGetLocationNull() throws Exception {
        assertNull(XMLParser.getLocation(null, null));
    }

    @Test
    public void testParseEvent() throws Exception {
        DefDescriptor<EventDef> eventDescriptor = definitionService.getDefDescriptor("test:anevent", EventDef.class);
        Source<EventDef> source = getSource(eventDescriptor);
        EventDefImpl eventDef = (EventDefImpl) eventXMLParser.parse(eventDescriptor, source);
        assertNotNull(eventDef);
        assertEquals("Unexpected Descriptor", eventDescriptor, eventDef.getDescriptor());
        assertEquals("Wrong event type", EventType.COMPONENT, eventDef.getEventType());
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = eventDef.getDeclaredAttributeDefs();
        assertEquals("Wrong number of attributes", 3, atts.size());
    }

    /**
     * Positive test: Parse a component with comments, new line character after
     * the end tag.
     * 
     * @throws Exception
     */
    @Test
    public void testParseComments() throws Exception {
        descriptor = definitionService.getDefDescriptor("test:test_Parser_Comments", ComponentDef.class);
        Source<ComponentDef> source = getSource(descriptor);
        def = componentXMLParser.parse(descriptor, source);
        assertEquals("Unexpected Descriptor", descriptor, def.getDescriptor());
    }
}
