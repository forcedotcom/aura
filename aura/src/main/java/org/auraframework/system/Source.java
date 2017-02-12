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
package org.auraframework.system;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;

/**
 * Interface for a Source.
 *
 * This should be instantiated as a sub-interface (never just plain Source) and the
 * resulting source must be for a valid resource (e.g. if it does not exist, don't create
 * the source). This is mainly because we return null in the case that there is no loader
 * found for the namespace, and rather than require a double check, we'd rather have a simple
 * test.
 */
public interface Source<D extends Definition> {
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
    String getSystemId();

    /**
     * Get the format of this source.
     */
    Format getFormat();

    /**
     * get the mime type.
     */
    String getMimeType();

    /**
     * Get the hash string for this source.
     *
     * @return the hash.
     */
    String getHash();

    /**
     * Get the last modified time for the source.
     */
    long getLastModified();

    /**
     * Due to case insensitivity, the best descriptor for this source may not be
     * what was requested. The one returned by this method is "best"
     */
    DefDescriptor<D> getDescriptor();

    /**
     * This adds support for default namespaces, so def handlers can properly deal
     * with child tags when looking at the source
     * @return true - if this source type supports default namespace, false - otherwise
     */
    boolean isDefaultNamespaceSupported();
    
    /**
     * Default namespace. Any source type that supports default namespace
     * should return a non-empty value
     * @return default namespace string
     */
    String getDefaultNamespace();
}
