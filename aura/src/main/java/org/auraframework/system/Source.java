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
package org.auraframework.system;

import java.io.*;
import java.net.URL;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;

/**
 * Abstract base class for providing access to source code, and metadata about that source code, including
 * systemId(URL or filename), the format, and timestamp. Implemented as abstract so that implementations
 * can create readers on demand rather than holding them open earlier than necessary.
 */
public abstract class Source<D extends Definition> implements Serializable {

    private static final long serialVersionUID = -1359253157810260816L;

    private final String systemId;
    private final Format format;
    private final DefDescriptor<D> descriptor;

    protected Source(DefDescriptor<D> descriptor, String systemId, Format format) {
        this.systemId = systemId;
        this.format = format;
        this.descriptor = descriptor;
    }

    /**
     * Gets the system ID of this source, which is a semi-arbitrary string to
     * name this source.  In practice, it is typically a filename relative
     * to one of the classpath roots ({@link ResourceSource}) or the working
     * directory ({@link FileSource}), but it can be something else (e.g. for
     * {@link StringSource}).
     *
     * @return the system id.
     */
    public String getSystemId() {
        return systemId;
    }

    public Format getFormat() {
        return format;
    }

    public abstract Reader getReader();

    public abstract Writer getWriter();

    /**
     * Gets an absolute URL to the given source, typically with one of
     * {@code file://}, {@code jar://}, or the non-standard {@code string://}
     * protocols.
     * 
     * Subclasses <em>SHOULD</em> override this, but existing legacy ones
     * will not, so we have a lame concrete implementation here.
     * 
     * @return String-format absolute representing this source.  This
     *    might not be valid to {@link java.net.URL}, for example for the
     *    {@code string://} protocol. 
     */
    public String getUrl() {
        return null;
    }
    
    /**
     * Returns either {@code null}, or the URL to a cached copy of this source,
     * if such a thing exists.  In most cases it will not, so the implementation
     * here always returns {@code null}.
     *
     * @return {@code null}, or in subclasses a URL to a cache copy.
     */
    public URL getCacheUrl() {
        return null;
    }

    public abstract boolean addOrUpdate(CharSequence newContents);

    public abstract String getContents();

    public abstract long getLastModified();

    public abstract boolean exists();

    /**
     * Due to case insensitivity, the best descriptor for this source may not be what was requested.
     * The one returned by this method is "best"
     */
    public DefDescriptor<?> getDescriptor(){
        return descriptor;
    }
    /**
     * Some Source types might want to clear their content before adding or updating
     * the source. For example StringSource.
     */
    public void clearContents(){
        //Do nothing.
    }
}
