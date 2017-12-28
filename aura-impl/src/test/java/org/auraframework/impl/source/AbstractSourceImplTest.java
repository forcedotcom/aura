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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.junit.Assert;
import org.junit.Test;


public class AbstractSourceImplTest {
    private class TestSourceImpl extends AbstractSourceImpl<Definition> {
        protected TestSourceImpl(DefDescriptor<Definition> descriptor, String systemId, Format format) {
            super(descriptor, systemId, format);
        }

        @Override
        public long getLastModified() {
            return 0;
        }

        @Override
        public String getHash() {
            return null;
        }
    }

    @Test
    public void testMimeTypeFromFormatJava() throws Exception {
        TestSourceImpl source = new TestSourceImpl(null, "hi", Format.XML);
        Assert.assertEquals("application/xml", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatJS() throws Exception {
        TestSourceImpl source = new TestSourceImpl(null, "hi", Format.JS);
        Assert.assertEquals("application/javascript", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatCSS() throws Exception {
        TestSourceImpl source = new TestSourceImpl(null, "hi", Format.CSS);
        Assert.assertEquals("text/css", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatTEMPLATE_CSS() throws Exception {
        TestSourceImpl source = new TestSourceImpl(null, "hi", Format.TEMPLATE_CSS);
        Assert.assertEquals("x-text/template-css", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatAPEX() throws Exception {
        TestSourceImpl source = new TestSourceImpl(null, "hi", Format.APEX);
        Assert.assertEquals("application/apex", source.getMimeType());
    }

    @Test
    public void testMimeTypeFromFormatSVG() throws Exception {
        TestSourceImpl source = new TestSourceImpl(null, "hi", Format.SVG);
        Assert.assertEquals("image/svg+xml", source.getMimeType());
    }
}
