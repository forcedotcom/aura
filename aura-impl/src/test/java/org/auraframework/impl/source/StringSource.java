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

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;

public class StringSource<D extends Definition> extends AbstractTextSourceImpl<D> {
    private final SourceListener sourceListener;
    private final transient StringData data;

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
        this(null, descriptor, contents, id, format);
    }

    /**
     * Full constructor, including a file monitor.
     *
     * Package private, this should only be used by StringSourceLoader
     *
     * @param sourceListener a place to notify of change events.
     * @param descriptor the descriptor for the source
     * @param contents contents (or null)
     * @param id an identifier for logging.
     * @param format the format of the descriptor (XML, JS, etc).
     */
    StringSource(SourceListener sourceListener, DefDescriptor<D> descriptor, String contents, String id, Format format) {
        super(descriptor, id, format);
        this.sourceListener = sourceListener;
        data = new StringData();
        if (contents != null) {
            data.write(contents);
        }
    }

    /**
     * Copy an existing StringSource with shared backing data.
     *
     * Package private, this should only be used by StringSourceLoader
     *
     * @param sourceListener TODO
     * @param original
     */
    StringSource(SourceListener sourceListener, StringSource<D> original) {
        super(original.getDescriptor(), original.getSystemId(), original.getFormat());
        this.sourceListener = sourceListener;
        data = original.data;
    }

    @Override
    public Reader getReader() {
        return new StringReader(data.getBuffer().toString());
    }

    @Override
    public String getContents() {
        //
        // TODO: W-1562068 - do something different.
        // This looks very strange, but it causes the hash to be calculated. 
        // We could perhaps do this other ways, but for the moment, we will
        // force it through a hashing reader.
        //
        try {
            StringWriter sw = new StringWriter();
            IOUtil.copyStream(getHashingReader(), sw);
            return sw.toString();
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
    }

    @Override
    public long getLastModified() {
        return data.lastModified;
    }

    public boolean addOrUpdate(CharSequence newContents) {
        if (newContents != null) {
            data.getBuffer().setLength(0);
            data.write(newContents.toString());
            if (sourceListener != null) {
                sourceListener.onSourceChanged(SourceMonitorEvent.CHANGED, null);
            }
        }
        return true;
    }

    public void clearContents() {
        data.getBuffer().setLength(0);
        data.touch();
        if (sourceListener != null) {
            sourceListener.onSourceChanged(SourceMonitorEvent.CHANGED, null);
        }
    }

    public long setLastModified(long lastModified) {
        long previous = data.lastModified;
        data.lastModified = lastModified;
        return previous;
    }

    private class StringData extends StringWriter {
        long lastModified = System.currentTimeMillis();

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

        private void touch() {
            lastModified = System.currentTimeMillis();

        }
    }
}
