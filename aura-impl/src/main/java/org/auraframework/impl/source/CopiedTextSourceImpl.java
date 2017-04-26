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
import org.auraframework.system.TextSource;

/**
 * Text source for making a copy of a text source with a variable descriptor and mime type.
 *
 * This is used when we have a context dependent descriptor/mime type (e.g. template CSS).
 */
public class CopiedTextSourceImpl<D extends Definition> extends AbstractTextSourceImpl<D> {
    private final String contents;
    private final String defaultNamespace;
    private long lastModified;

    public CopiedTextSourceImpl(TextSource<D> original) {
        this(original.getDescriptor(), original, original.getMimeType());
    }

    public CopiedTextSourceImpl(DefDescriptor<D> descriptor, TextSource<D> original, String mimeType) {
        super(descriptor, original.getSystemId(), mimeType);
        this.contents = original.getContents();
        this.defaultNamespace = original.getDefaultNamespace();
        this.hash.setHash(this.contents.getBytes());
        this.lastModified = original.getLastModified();
    }

    @Override
    public Reader getReader() {
        return new StringReader(this.contents);
    }


    @Override
    public String getContents() {
        return this.contents;
    }

    @Override
    public String getDefaultNamespace() {
        return this.defaultNamespace;
    }

    public long getLastModified() {
        return this.lastModified;
    }
}
