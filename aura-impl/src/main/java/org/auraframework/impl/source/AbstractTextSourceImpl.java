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
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;
import org.auraframework.util.text.Hash;
import org.auraframework.util.text.HashingReader;

import com.google.common.collect.ImmutableMap;

/**
 * Abstract base class for providing access to source code and metadata.
 *
 * Implemented as abstract with inversion of control.
 *
 * Implementors should read the comments for {@link #getHash()} and ensure they honor the
 * contract.
 */
public abstract class AbstractTextSourceImpl<D extends Definition> implements TextSource<D> {
    public final static String MIME_JAVASCRIPT = "application/javascript";
    public final static String MIME_HTML = "text/html";
    public final static String MIME_XML = "application/xml";
    public final static String MIME_CSS = "text/css";
    public final static String MIME_TEMPLATE_CSS = "x-text/template-css";
    public final static String MIME_SVG = "image/svg+xml";

    private final String systemId;
    private final Format format;
    private final String mimeType;
    private final DefDescriptor<D> descriptor;
    protected final Hash hash;

    protected AbstractTextSourceImpl(DefDescriptor<D> descriptor, String systemId, String mimeType) {
        this.systemId = systemId;
        this.format = null;
        this.descriptor = descriptor;
        this.hash = Hash.createPromise();
        this.mimeType = mimeType;
    }

    private Map<Format,String> formatMimeMap = new ImmutableMap.Builder<Format,String>()
        .put(Format.APEX, "application/apex")
        .put(Format.CSS, MIME_CSS)
        .put(Format.JS, MIME_JAVASCRIPT)
        .put(Format.SVG, MIME_SVG)
        .put(Format.TEMPLATE_CSS, MIME_TEMPLATE_CSS)
        .put(Format.XML, MIME_XML)
        .build();
        

    protected AbstractTextSourceImpl(DefDescriptor<D> descriptor, String systemId, Format format) {
        this.systemId = systemId;
        this.format = format;
        this.mimeType = formatMimeMap.get(format);
        this.descriptor = descriptor;
        this.hash = Hash.createPromise();
    }

    /**
     * Gets the system ID of this source, which is a semi-arbitrary string to
     * name this source. In practice, it is typically a filename relative to one
     * of the classpath roots (
     * {@link org.auraframework.impl.source.ResourceSource} ) or the working
     * directory ({@link org.auraframework.impl.source.FileSource}), but it can
     * be something else (e.g. for
     * {@link org.auraframework.impl.source.StringSource}).
     * 
     * @return the system id.
     */
    @Override
    public String getSystemId() {
        return systemId;
    }

    /**
     * Get the format of this source.
     */
    @Override
    public Format getFormat() {
        return format;
    }

    /**
     * get the mime type.
     */
    @Override
    public String getMimeType() {
        return mimeType;
    }

    /**
     * Gets a {@link Reader} for this source, typically as the underlying reader
     * to {@link #getHashingReader()}. Most callers want that method instead,
     * which ensures that characters are used to construct a fingerprint as they
     * are read; this should someday become protected.
     * 
     * @return
     */
    @Override
    public abstract Reader getReader();

    /**
     * Get the hash promise for this source.
     *
     * This <em>MUST</em> be valid by the time we are done with this source. In the case of
     * this abstract class, {@link getHashingReader()} is the arbiter of this guarantee.
     * If the entire file is read, we will have a valid hash. If this is overridden,
     * the class that overrides it <em>MUST</em> guarantee that if either {@link getContents()} or
     * {@link getHashingReader()} are called, the hash will be set (it can also arbitrarily
     * be set elsewhere. As long as it is valid after reading the contents.
     *
     * @return the hash promise.
     */
    @Override
    public String getHash() {
        return hash.isSet()?hash.toString():null;
    }

    @Override
    public final Reader getHashingReader() {
        if (hash.isSet()) {
            // We don't need to re-hash after we've set our source. Actually,
            // we should never need to re-read, but today we do.
            return getReader();
        }
        return new HashingReader(getReader(), hash);
    }

    @Override
    public abstract String getContents();

    /**
     * Due to case insensitivity, the best descriptor for this source may not be
     * what was requested. The one returned by this method is "best"
     */
    @Override
    public DefDescriptor<D> getDescriptor() {
        return descriptor;
    }

    /**
     * This adds support for default namespaces, so def handlers can properly deal
     * with child tags when looking at the source
     * @return true - if this source type supports default namespace, false - otherwise
     */
    @Override
    public final boolean isDefaultNamespaceSupported() {
        return StringUtils.isNotEmpty(getDefaultNamespace());
    }
    
    /**
     * Default namespace. Any source type that supports default namespace
     * should return a non-empty value
     * @return default namespace string
     */
    @Override
    public String getDefaultNamespace() {
        return null;
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
