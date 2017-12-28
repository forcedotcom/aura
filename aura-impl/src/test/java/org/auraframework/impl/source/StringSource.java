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
import java.io.StringReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;
import org.auraframework.util.text.Hash;

public class StringSource<D extends Definition> extends AbstractSourceImpl<D> implements TextSource<D> {
    private final String contents;
    private final String hashValue;
    private final long lastModified;

    /**
     * Constructor for use of 'standalone' string sources.
     *
     * This is primarily for testing uses of string source where the entire infrastructure is not needed. The
     * String source is not hooked in to the file monitor, and no change notifications are sent.
     *
     * @param descriptor the descriptor for the source
     * @param contents contents (or null)
     * @param id an identifier for logging.
     * @param format the format of the descriptor (XML, JS, etc).
     */
    public StringSource(DefDescriptor<D> descriptor, String contents, String id, Format format) {
        super(descriptor, id, format);
        this.contents = contents;
        this.hashValue = new Hash.StringBuilder().addString(contents).build().toString();
        this.lastModified = System.currentTimeMillis();
    }

    @Override
    public Reader getReader() {
        return new StringReader(contents);
    }

    @Override
    public String getContents() {
        return contents;
    }

    @Override
    public long getLastModified() {
        return lastModified;
    }

    @Override
    public String getHash() {
        return hashValue;
    }
}
