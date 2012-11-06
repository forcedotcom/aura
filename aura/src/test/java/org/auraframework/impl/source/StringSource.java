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

import java.io.*;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

public class StringSource<D extends Definition> extends Source<D> implements Serializable{

    private static final long serialVersionUID = 8822758262106180101L;
    private final transient StringWriter writer = new StringWriter();
    private final StringBuffer sb = writer.getBuffer();
    private final long lastModified;

    public StringSource(DefDescriptor<D> descriptor, String contents, String id, Format format) {
        this(descriptor, contents, id, format, 0);
    }

    public StringSource(DefDescriptor<D> descriptor, String contents, String id, Format format, long lastModified) {
        super(descriptor, id, format);
        this.sb.append(contents);
        this.lastModified = lastModified;
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
        sb.append(newContents);
        return true;
    }

    @Override
    public void clearContents() {
        writer.getBuffer().setLength(0);
    }
}
