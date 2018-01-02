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
package org.auraframework.impl.source.file;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.AbstractSourceImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;
import org.auraframework.util.text.Hash;
import org.auraframework.util.text.HashingReader;

import com.google.common.collect.ImmutableMap;

public class FileSource<D extends Definition> extends AbstractSourceImpl<D> implements TextSource<D> {
    private final File file;
    private final long lastModified;
    private final Hash hash;
    private volatile String contents;

    /**
     * The 'normal' constructor for a file source.
     *
     * This constructor gets both the file path and the mime type from the file given.
     * The file must exist prior to constructing the source. Behaviour is undefined
     * if the file does not exist, please do not test this case.
     *
     * @param descriptor the descriptor for the source.
     * @param file the file that contains the source.
     */
    public FileSource(DefDescriptor<D> descriptor, File file) throws IOException {
        super(descriptor, getFilePath(file), getMimeTypeFromExtension(file.getName()));
        this.file = file;
        this.lastModified = file.lastModified();
        this.hash = Hash.createPromise();
    }

    /**
     * A 'format' based constructor.
     *
     * This constructor gets both the file path and the mime type from the file given.
     * The file must exist prior to constructing the source. Behaviour is undefined
     * if the file does not exist, please do not test this case.
     *
     * @param descriptor the descriptor for the source.
     * @param file the file that contains the source.
     */
    public FileSource(DefDescriptor<D> descriptor, File file, Format format) {
        super(descriptor, getFilePath(file), format);
        this.file = file;
        this.lastModified = file.lastModified();
        this.hash = Hash.createPromise();
    }

    @Override
    public Reader getReader() {
        return new StringReader(getContents());
    }

    @Override
    public long getLastModified() {
        return lastModified;
    }

    @Override
    public String getHash() {
        if (!hash.isSet()) {
            throw new RuntimeException("No hash set");
        }
        return hash.toString();
    }

    public static String getFilePath(File file) {
        try {
            if (!file.exists()) {
                throw new AuraRuntimeException("File does not exist: " + file.getPath());
            }
            return file.getCanonicalPath();
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    /**
     * @see Source#getContents()
     */
    @Override
    public String getContents() {
        if (contents != null) {
            return contents;
        }
        synchronized (this) {
            if (contents != null) {
                return contents;
            }
            try {
                Reader reader = new InputStreamReader(new FileInputStream(file), "UTF8");
                reader = new HashingReader(reader, hash);
                StringWriter sw = new StringWriter();
                IOUtil.copyStream(reader, sw);
                contents = sw.toString();
            } catch (FileNotFoundException e) {
                throw new AuraRuntimeException(e);
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }
        }
        return contents;
    }

    private final static Map<String,String> mimeMap;

    static {
        mimeMap = new ImmutableMap.Builder<String,String>()
            .put("js", MIME_JAVASCRIPT)
            .put("html", MIME_HTML)
            .put("cmp", MIME_XML)
            .put("lib", MIME_XML)
            .put("app", MIME_XML)
            .put("css", MIME_CSS)
            .put("evt", MIME_XML)
            .put("intf", MIME_XML)
            .put("svg", MIME_SVG)
            .build();
    }

    /**
     * Get an aura mime type based on the extension.
     *
     * This is used to figure out mime types for files.
     *
     * @param name the file name to use.
     * @return a mime type for the file, "X-application/unknown" for anything we don't understand.
     */
    public static String getMimeTypeFromExtension(String name) {
        int idx = name.lastIndexOf('.');
        String mimetype = null;
        if (idx != -1) {
            String ext = name.substring(idx+1);
            mimetype = mimeMap.get(ext);
        }
        if (mimetype != null) {
            return mimetype;
        }
        return "X-application/unknown";
    }
}
