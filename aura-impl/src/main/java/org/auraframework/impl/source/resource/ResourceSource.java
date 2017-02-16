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

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.AbstractTextSourceImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;

/**
 * {@link Source} implementation for source code loaded as a resource from the
 * Java classpath.
 */
public class ResourceSource<D extends Definition> extends AbstractTextSourceImpl<D> {
    private static final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();

    public ResourceSource(DefDescriptor<D> descriptor, String systemId) {
        super(descriptor, systemId, getMimeTypeFromExtension(systemId));
    }

    public ResourceSource(DefDescriptor<D> descriptor, String systemId, Format format) {
        super(descriptor, systemId, format);
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
    public Reader getReader() {
        InputStream is = resourceLoader.getResourceAsStream(getSystemId());
        if (is == null) {
            throw new AuraRuntimeException("Resource not found: " + getSystemId());
        }
        return new InputStreamReader(is);
    }

    @Override
    public long getLastModified() {
        return 0L;
    }
}
