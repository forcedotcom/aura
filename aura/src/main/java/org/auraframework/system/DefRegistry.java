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

import java.io.Serializable;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;


/**
 * Public interface for retrieving aura definitions.
 *
 * This interface has several implementations with highly variable performance parameters.
 * There should be no assumption that exists/getDef/find are efficient.
 *
 * Note: The typing here is as bogus as it gets. T is not valid.
 */
public interface DefRegistry extends Serializable {

    /**
     * Return the definition for this descriptor, or null if it does not exist.
     * 
     * This will only load the definition, it will not fully compile it.
     * 
     * @throws QuickFixException
     */
    @CheckForNull
    <T extends Definition> T getDef(DefDescriptor<T> descriptor) throws QuickFixException;

    /**
     * Return true if the find methods work.
     * 
     * @return true if find will not throw 'UnsupportedOperationException'
     */
    boolean hasFind();

    /**
     * Given a string that contains search patterns or wildcards, return a set
     * of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and
     * does not guarantee that they can compile.
     */
    @Nonnull
    Set<DefDescriptor<?>> find(@Nonnull DescriptorFilter matcher);

    /**
     * Returns true if the source related to the descriptor exists. Does not
     * compile the definition if it was not already compiled, and does not
     * guarantee that it can compile.
     */
    <T extends Definition> boolean exists(DefDescriptor<T> descriptor);

    /**
     * The DefTypes that this registry handles (returns)
     */
    @Nonnull
    Set<DefType> getDefTypes();

    /**
     * The Prefixes that this registry handles
     */
    @Nonnull
    Set<String> getPrefixes();

    /**
     * Returns a Set of namespaces for which this registry is authoritative. "*"
     * indicates that the registry should be used when no other registry has
     * registered for a namespace.
     */
    @Nonnull
    Set<String> getNamespaces();

    /**
     * Get the source file for a descriptor.
     *
     * This is not always available, and so may return null even if the descriptor has a definition.
     */
    @CheckForNull
    <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor);

    /**
     * return true if the caller can cache the value.
     *
     * This means that the def for a descriptor should not be mutable. The only exception here is that
     * change notifications will flush the cache.
     */
    boolean isCacheable();

    /**
     * reset the registry.
     *
     * This can either do something or nothing depending on the registry. It will be called if there is a change
     * to a file that is contained in the directory associated with the registry.
     */
    void reset();

    /**
     * Return true if registry cannot change after creation.
     *
     * There is an implicit assumption that static registries are fast, and thus need not be cached
     * by the implementation.
     */
    boolean isStatic();
}
