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
package org.auraframework.test.source;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;

/**
 * This source loader allows tests to load and unload source from strings.
 *
 * This loader is a singleton to ensure that it can be authoritative for the "string" namespace.
 *
 * FIXME: W-1933490!!!! The namespaces map is very dangerous here, as it is mutable in ways that aura does not expect.
 * There is a lock to ensure that the read/modify/write operations that are used by source 'put' methods are atomic, but
 * that does not guarantee coherency. In particular, we may lie to aura and say that we have namespaces that we don't,
 * or provide descriptors via find that aura will not be able to find because it has a fixed idea of the namespaces
 * represented. This could be fixed by providing a fixed view into the namespaces provided.
 *
 */
public interface StringSourceLoader extends SourceLoader, InternalNamespaceSourceLoader {
    String DEFAULT_NAMESPACE = "string";
    String OTHER_NAMESPACE = "string1";
    String DEFAULT_CUSTOM_NAMESPACE = "cstring";
    String OTHER_CUSTOM_NAMESPACE = "cstring1";
    String ANOTHER_CUSTOM_NAMESPACE = "cstring2";
    String DEFAULT_PRIVILEGED_NAMESPACE = "privilegedNS";
    String OTHER_PRIVILEGED_NAMESPACE = "privilegedNS1";

    enum NamespaceAccess {
        INTERNAL,
        PRIVILEGED,
        CUSTOM
    };

    /**
     * Generate a {@link DefDescriptor} with a unique name. If namePrefix does not contain a namespace, the descriptor
     * will be created in the 'string' namespace. If namePrefix does not contain the name portion (i.e. it is null,
     * empty, or just a namespace with the trailing delimiter), 'thing' will be used as the base name.
     * 
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param defClass the interface of the type definition
     * @return a {@link DefDescriptor} with name that is guaranteed to be unique in the string: namespace.
     */
    <D extends Definition, B extends Definition> DefDescriptor<D> createStringSourceDescriptor(
            @Nullable String namePrefix, Class<D> defClass, @Nullable DefDescriptor<B> bundle);

    /**
     * Load a new definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param access the access type of the namespace.
     * @return the created {@link Source}
     * @throws IllegalStateException when loading a definition that already exists with the same descriptor.
     */
    <D extends Definition> Source<D> addSource(Class<D> defClass, String contents,
                                                     @Nullable String namePrefix, NamespaceAccess type);

    /**
     * Load a definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param overwrite if true, overwrite any previously loaded definition
     * @param access the access type of the namespace.
     * @return the created {@link Source}
     */
    <D extends Definition> Source<D> putSource(Class<D> defClass, String contents,
                                                     @Nullable String namePrefix, boolean overwrite, NamespaceAccess access);

    /**
     * Load a definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param overwrite if true, overwrite any previously loaded definition
     * @param access the access type of the namespace.
     * @return the created {@link Source}
     */
    <D extends Definition, B extends Definition> Source<D> putSource(Class<D> defClass, String contents,
                                                                           @Nullable String namePrefix,
                                                                           boolean overwrite, NamespaceAccess access,
                                                                           @Nullable DefDescriptor<B> bundle);

    /**
     * Load a definition.
     * 
     * @param descriptor the DefDescriptor key for the loaded definition
     * @param contents the source contents
     * @param overwrite if true, overwrite any previously loaded definition
     * @return the created {@link Source}
     */
    <D extends Definition> Source<D> putSource(DefDescriptor<D> descriptor, String contents, boolean overwrite);

    /**
     * Load a definition.
     * 
     * @param descriptor the DefDescriptor key for the loaded definition
     * @param contents the source contents
     * @param overwrite if true, overwrite any previously loaded definition
     * @param access the access type for the namespace
     * @return the created {@link Source}
     */
    <D extends Definition> Source<D> putSource(DefDescriptor<D> descriptor, String contents,
                                                     boolean overwrite, NamespaceAccess access);

    /**
     * Remove a definition from the source loader.
     * 
     * @param descriptor the descriptor identifying the loaded definition to remove.
     */
    void removeSource(DefDescriptor<?> descriptor);

    /**
     * Remove a definition from the source loader.
     * 
     * @param source the loaded definition to remove.
     */
    void removeSource(Source<?> source);

    /**
     * Is a given namespace privileged?
     */
    boolean isPrivilegedNamespace(String namespace);

    /**
     * Return the Source for the given descriptor.
     * 
     * @param descriptor
     * @return Source referenced by descriptor
     */
    @Override
    <D extends Definition> Source<D> getSource(@Nonnull DefDescriptor<D> descriptor);
}
