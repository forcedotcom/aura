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
package org.auraframework.impl.source.resource;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URL;
import java.util.concurrent.ExecutionException;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;

/**
 * {@link Source} implementation for source code loaded as a resource from the
 * Java classpath.
 */
public class ResourceSource<D extends Definition> extends Source<D> {

    private static final long serialVersionUID = 7135275798418700286L;
    private static final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();

    protected ResourceSource(DefDescriptor<D> descriptor, String systemId, Format format) {
        super(descriptor, systemId, format);
    }

    @Override
    public boolean addOrUpdate(CharSequence newContents) {
        Writer writer = null;
        try {
            try {
                writer = resourceLoader.getWriter(getSystemId());
                writer.write(newContents.toString());
            } finally {
                writer.close();
            }
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
        return true;
    }

    /**
     * Provides a URL to the source object. This will typically be either a
     * {@code jar://} or a {@code file://} URL. Note that this is the "real" URL
     * (for location information), but that the {@link ResourceLoader} will have
     * shadowed that as a {@code resource://} URL internally.
     * 
     * @returns a URL to the source, as a String. (Other kinds of sources may
     *          need to return semi-valid URLs, but this one will always be
     *          valid.)
     */
    @Override
    public String getUrl() {
        return resourceLoader.getRawResourceUrl(getSystemId()).toString();
    }

    /**
     * Provides a location to the cache object, if any. This may be {@code null}
     * , or may be a filename.
     * 
     * @throws ExecutionException
     */
    @Override
    public URL getCacheUrl() {
        try {
            return resourceLoader.getCachedResourceUrl(getSystemId());
        } catch (ExecutionException e) {
            return null; // Guess there's no (useful) cache...
        }
    }

    @Override
    public boolean exists() {
        return resourceLoader.getRawResourceUrl(getSystemId()) != null;
    }

    @Override
    public String getContents() {
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
        return -1;
    }

    @Override
    public Reader getReader() {
        InputStream is = resourceLoader.getResourceAsStream(getSystemId());
        if (is == null) {
            throw new AuraRuntimeException("Resource not found: " + getSystemId());
        }
        return new InputStreamReader(is);
    }

    @Override
    public Writer getWriter() {
        throw new UnsupportedOperationException();
    }

}
