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

import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefDescriptor.DefType;

/**
 */
public interface SourceLoader {

    /**
     * Returns a list of namespaces for which this loader is authoritative.
     *
     * @return List of names of namespaces that this SourceLoader handles.
     */
    Set<String> getNamespaces();

    /**
     * Returns a list of prefixes (java/js/apex) for which this loader is authoritative within the
     * namespaces returned by getNamespaces.
     *
     * @return List of prefixes that this SourceLoader handles.
     */
    Set<String> getPrefixes();

    /**
     * Returns a list of DefTypes for which this loader is authoritiative within the
     * namespaces returned by getNamespaces and the prefixes returned by getPrefixes.
     */
    Set<DefType> getDefTypes();

    /**
     * Return the Source for the given descriptor.
     *
     * @param descriptor
     * @return Source referenced by descriptor
     */
    <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor);

    /**
     * Match descriptors agains a matcher.
     */
    Set<DefDescriptor<?>> find(DescriptorMatcher dm);

    <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace);
}
