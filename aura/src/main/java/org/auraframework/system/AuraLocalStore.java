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

import java.util.Map;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;

import com.google.common.base.Optional;

public interface AuraLocalStore {
    /**
     * Set "System" mode, preventing defs from going to the client.
     *
     * FIXME: this should not exist
     */
    void setSystemMode(boolean value);

    /**
     * Check if a local def is not cacheable.
     *
     * @param descriptor the descriptor to check.
     * @return true if the def is not cacheable.
     */
    boolean isDefNotCacheable(@Nonnull DefDescriptor<?> descriptor);

    /**
     * Mark a local def as not cacheable.
     *
     * @param descriptor the descriptor to mark
     */
    void setDefNotCacheable(@Nonnull DefDescriptor<?> descriptor);

    /**
     * Get Optional wrapping a locally cached def.
     *
     * This is a three state return
     * * null if there is no def present
     * * Optional(null) if the def was not found
     * * Optional(value) if the def is present
     *
     * @param descriptor The descriptor for which we want the definition
     * @return the wrapping Optional, or null if there is no locally cached def
     */
    @CheckForNull
    <D extends Definition> Optional<D> getDefinition(DefDescriptor<D> descriptor);

    /**
     * Add a local def to the cache.
     *
     * @param descriptor the descriptor for the def to add.
     * @param d the definition to add (can be null)
     */
    void addDefinition(@Nonnull DefDescriptor<?> descriptor, @CheckForNull Definition d);

    /**
     * Get the dependency entry for a given key.
     *
     * @param key the key to look up
     * @return the dependency entry, or null if none was found.
     */
    DependencyEntry getDependencyEntry(@Nonnull String key);

    /**
     * Find a dependency entry that contains a descriptor.
     *
     * FIXME: this routine is inefficient by design, and should probably be removed.
     *
     * @param descriptor the descriptor to search.
     * @return a dependency entry that contains the descriptor.
     */
    DependencyEntry findDependencyEntry(@Nonnull DefDescriptor<?> descriptor);

    /**
     * Add a dynamic definition.
     *
     * @param def the definition to insert (non-null)
     */
    <D extends Definition> void addDynamicDefinition(@Nonnull D def);

    /**
     * Add matches from the dynamic defs that are in the store.
     *
     * @param matched the set to fill.
     * @param matcher the matcher for finding descriptors.
     */
    void addDynamicMatches(@Nonnull Set<DefDescriptor<?>> matched, @Nonnull DescriptorFilter matcher);

    /**
     * Add a dependency entry to the local store.
     *
     * @param key the key for the dependency entry.
     * @param de the dependency entry.
     */
    void addDependencyEntry(String key, @Nonnull DependencyEntry de);

    /**
     * Get all of the definitions from the local store.
     *
     * @return the set of non-null definitions in the store.
     */
    @Nonnull
    Map<DefDescriptor<? extends Definition>, Definition> getDefinitions();
}
