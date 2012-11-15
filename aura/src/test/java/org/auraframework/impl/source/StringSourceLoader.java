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
package org.auraframework.impl.source;

import java.util.Date;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.system.DescriptorMatcher;
import javax.annotation.Nullable;
import javax.annotation.concurrent.GuardedBy;


import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * This source loader allows tests to load and unload source from strings rather than from the file system or looking at
 * the classpath. This loader is a singleton to ensure that it can be authoritative for the "string" namespace.
 */
public class StringSourceLoader implements SourceLoader{
    public static final String NAMESPACE = "string";
    private static final String DEFAULT_NAME_PREFIX = "thing";
    private static final Set<String> PREFIXES = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    private static final Set<String> NAMESPACES = ImmutableSet.of(NAMESPACE);
    private static final Set<DefType> DEFTYPES = EnumSet.of(DefType.COMPONENT, DefType.INTERFACE, DefType.EVENT);

    /**
     * This map stores all of the sources owned by this loader.
     */
    @GuardedBy("this")
    private final Map<DefDescriptor<?>, Source<?>> sources = Maps.newHashMap();

    /**
     * A counter that we can use to guarantee unique names across multiple calls to add a source.
     */
    @GuardedBy("this")
    private static int counter = 0;

    private StringSourceLoader() {}

    /**
     * A helper to hold the singleton instance.
     */
    private static class SingletonHolder {
        private static final StringSourceLoader INSTANCE = new StringSourceLoader();
    }

    public static StringSourceLoader getInstance(){
        return SingletonHolder.INSTANCE;
            }

    /**
     * Generate a {@link DefDescriptor} with a unique name in the 'string' namespace.
     * 
     * @param namePrefix
     *            if non-null, then generate some name with the given prefix for the descriptor.
     * @param defClass
     *            the interface of the type definition
     * @return a {@link DefDescriptor} with name that is guaranteed to be unique in the string: namespace.
     */
    public final synchronized <T extends Definition> DefDescriptor<T> createStringSourceDescriptor(
            @Nullable String namePrefix, Class<T> defClass) {
        if (namePrefix == null || namePrefix.isEmpty()) {
            namePrefix = DEFAULT_NAME_PREFIX;
        }
        String name = namePrefix + "_" + counter++;
        return Aura.getDefinitionService().getDefDescriptor(
                String.format("%s://%s:%s", DefDescriptor.MARKUP_PREFIX, NAMESPACE, name), defClass);
    }

    /**
     * Update the contents and lastModified of an already loaded definition.
     * 
     * @param descriptor
     *            the descriptor pointing at the definition to update
     * @param contents
     *            the new source contents
     * @param lastModified
     *            the new last modification time
     * @return the updated descriptor
     */
    public synchronized final <T extends Definition> DefDescriptor<T> updateSource(DefDescriptor<T> descriptor,
            String contents, Date lastModified) {
        Preconditions.checkArgument(descriptor.getNamespace().equals(NAMESPACE));
        Preconditions.checkState(sources.get(descriptor) != null);

        return putSource(descriptor, contents, lastModified);
    }

    /**
     * Load a new definition
     * 
     * @param descriptor
     *            a descriptor in the 'string' namespace that is not currently loaded.
     * @param contents
     *            the source contents
     * @param lastModified
     *            the last modification
     */
    public synchronized final <T extends Definition> void addSource(DefDescriptor<T> descriptor, String contents,
            Date lastModified) {
        Preconditions.checkArgument(descriptor.getNamespace().equals(NAMESPACE));
        Preconditions.checkState(sources.get(descriptor) == null);

        putSource(descriptor, contents, lastModified);
    }

    /**
     * Remove a definition from the source loader.
     * 
     * @param descriptor
     *            the descriptor identifying the loaded definition to remove.
     */
    public synchronized final void removeSource(DefDescriptor<?> descriptor){
        Preconditions.checkState(sources.get(descriptor) != null);
        sources.remove(descriptor);
    }

    /**
     * Load the definition identified by the descriptor with the given contents and last modified time into this loader.
     * 
     * @return the descriptor
     */
    private synchronized final <T extends Definition> DefDescriptor<T> putSource(DefDescriptor<T> descriptor,
            String contents, Date lastModified) {
        Source<T> source = new StringSource<T>(descriptor, contents, descriptor.getQualifiedName(), Format.XML,
                lastModified.getTime());
        sources.put(descriptor, source);
        return descriptor;
    }

    @Override
    public synchronized Set<DefDescriptor<?>> find(DescriptorMatcher matcher) {
        Set<DefDescriptor<?>> ret = Sets.newHashSet();

        // Since we only have one namespace, we can easily exclude if we don't match.
        if (!matcher.matchNamespace(NAMESPACE)) {
            return ret;
        }
        for(DefDescriptor<?> desc : sources.keySet()){
            if (matcher.matchPrefix(desc.getPrefix()) && matcher.matchName(desc.getName())) {
                ret.add(desc);
            }
        }

        return ret;
    }

    @SuppressWarnings("unchecked")
    @Override
    public synchronized <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix,
            String namespace) {
        Set<DefDescriptor<T>> ret = Sets.newHashSet();

        for(DefDescriptor<?> desc : sources.keySet()){
            if (desc.getDefType().getPrimaryInterface() == primaryInterface && desc.getPrefix().equals(prefix)
                    && desc.getNamespace().equals(namespace)) {
                ret.add((DefDescriptor<T>)desc);
            }
        }
        return ret;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return DEFTYPES;
    }

    @Override
    public Set<String> getNamespaces() {
        return NAMESPACES;
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    @SuppressWarnings("unchecked")
    @Override
    public synchronized <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        Source<D> ret = (Source<D>)sources.get(descriptor);
        return ret;
    }
}
