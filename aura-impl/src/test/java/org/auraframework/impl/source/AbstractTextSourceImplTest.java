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
package org.auraframework.impl.source;

import java.io.Reader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.Parser.Format;
import org.junit.Test;


public class AbstractTextSourceImplTest extends AuraImplTestCase {

    @Test
    public void testMimeTypeGarbage() {
        assertEquals("X-application/unknown", AbstractTextSourceImpl.getMimeTypeFromExtension("IDontKnow"));
    }

    @Test
    public void testMimeTypeUnknownExtension() {
        assertEquals("X-application/unknown", AbstractTextSourceImpl.getMimeTypeFromExtension("this.blahdedah"));
    }

    @Test
    public void testMimeTypeEmptyExtension() {
        assertEquals("X-application/unknown", AbstractTextSourceImpl.getMimeTypeFromExtension("this."));
    }

    @Test
    public void testMimeTypeComponent() {
        assertEquals("application/xml", AbstractTextSourceImpl.getMimeTypeFromExtension("this.cmp"));
    }

    @Test
    public void testMimeTypeComponentWithExtraDot() {
        assertEquals("application/xml", AbstractTextSourceImpl.getMimeTypeFromExtension("this.that.cmp"));
    }

    @Test
    public void testMimeTypeLibrary() {
        assertEquals("application/xml", AbstractTextSourceImpl.getMimeTypeFromExtension("this.lib"));
    }

    @Test
    public void testMimeTypeInterface() {
        assertEquals("application/xml", AbstractTextSourceImpl.getMimeTypeFromExtension("this.intf"));
    }

    @Test
    public void testMimeTypeEvent() {
        assertEquals("application/xml", AbstractTextSourceImpl.getMimeTypeFromExtension("this.evt"));
    }

    @Test
    public void testMimeTypeApplication() {
        assertEquals("application/xml", AbstractTextSourceImpl.getMimeTypeFromExtension("this.app"));
    }

    @Test
    public void testMimeTypeJavascript() {
        assertEquals("application/javascript", AbstractTextSourceImpl.getMimeTypeFromExtension("this.js"));
    }

    private class TestTextSourceImpl extends AbstractTextSourceImpl<Definition> {
        protected TestTextSourceImpl(DefDescriptor<Definition> descriptor, String systemId, Format format) {
            super(descriptor, systemId, format);
        }

        @Override
        public long getLastModified() {
            return 0;
        }

        @Override
        public Reader getReader() {
            return null;
        }

        @Override
        public String getContents() {
            return null;
        }
    }

    @Test
    public void testMimeTypeFromFormatJava() throws Exception {
        TestTextSourceImpl source = new TestTextSourceImpl(null, "hi", Format.XML);
        assertEquals("application/xml", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatJS() throws Exception {
        TestTextSourceImpl source = new TestTextSourceImpl(null, "hi", Format.JS);
        assertEquals("application/javascript", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatCSS() throws Exception {
        TestTextSourceImpl source = new TestTextSourceImpl(null, "hi", Format.CSS);
        assertEquals("text/css", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatTEMPLATE_CSS() throws Exception {
        TestTextSourceImpl source = new TestTextSourceImpl(null, "hi", Format.TEMPLATE_CSS);
        assertEquals("x-text/template-css", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatAPEX() throws Exception {
        TestTextSourceImpl source = new TestTextSourceImpl(null, "hi", Format.APEX);
        assertEquals("application/apex", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatSVG() throws Exception {
        TestTextSourceImpl source = new TestTextSourceImpl(null, "hi", Format.SVG);
        assertEquals("image/svg+xml", source.getMimeType());
    }
}
