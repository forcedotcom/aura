/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

public class StringSource<D extends Definition> extends Source<D> {

    private static final long serialVersionUID = 8822758262106180101L;
    private final transient StringWriter writer = new StringWriter() {
        @Override
        public void write(int c) {
            super.write(c);
            touch();
        }

        @Override
        public void write(char[] cbuf) throws IOException {
            super.write(cbuf);
            touch();
        }

        @Override
        public void write(String str) {
            super.write(str);
            touch();
        }

        @Override
        public void write(char[] cbuf, int off, int len) {
            super.write(cbuf, off, len);
            touch();
        }

        @Override
        public void write(String str, int off, int len) {
            super.write(str, off, len);
            touch();
        }
    };
    
    private final StringBuffer sb = writer.getBuffer();
    private long lastModified;

    public StringSource(DefDescriptor<D> descriptor, String contents, String id, Format format) {
        super(descriptor, id, format);
        this.sb.append(contents);
        this.lastModified = 0;
    }

    @Override
    public long getLastModified() {
        return lastModified;
    }

    @Override
    public Reader getReader() {
        return new StringReader(getContents());
    }


    @Override
    public String getContents() {
        return sb.toString();
    }

    @Override
    public Writer getWriter() {
        return writer;
    }

    /** StringSource returns a "URL" like "markup://string:foo". */
    @Override
    public String getUrl() {
        return getSystemId();  // e.g. "markup://string:thing"
    }

    @Override
    public boolean exists() {
        return sb.length() > 0;
    }

    @Override
    public boolean addOrUpdate(CharSequence newContents) {
        if (newContents != null) {
            clearContents();
            sb.append(newContents);
        }
        touch();
        return true;
    }

    @Override
    public void clearContents() {
        sb.setLength(0);
        touch();
    }
    
    public long setLastModified(long lastModified) {
        long previous = this.lastModified;
        this.lastModified = lastModified;
        return previous;
    }

    private void touch() {
        setLastModified(System.currentTimeMillis());
    }
}
