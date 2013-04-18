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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Master Definition Registry.
 * 
 * All other (type-specific) registries are delegated to by a master def
 * registry. The master definition registry handles all of the compilation and
 * cross registry references.
 * 
 * The GUID referenced here is a globally unique ID for the top level definition
 * passed in. This ID is used to ensure that the client version matches the
 * local version.
 *
 * TODO: To handle global invalidates (e.g. a filesystem watcher or DB update watcher),
 * there will be a callback mechanism that clears out the global cache.
 */
public interface MasterDefRegistry {
    /**
     * Return the definition for this descriptor, or null if it does not exist.
     * 
     * If the definition was not already compiled, this method will cause it to
     * be compiled before it is returned. Any dependent definitions will be
     * loaded.
     *
     * Note that this does no permissions checking, and so will return the definition
     * even if the caller should not have access. It should only be used internally
     *
     * @param descriptor the descriptor to find.
     * @return the corresponding definition, or null if it doesn't exist.
     * @throws QuickFixException if there is a compile time error.
     */
    <D extends Definition> D getDef(DefDescriptor<D> descriptor) throws QuickFixException;

    /**
     * Save the given definition back to appropriate source location.
     */
    <D extends Definition> void save(D def);

    /**
     * Given a descriptor that contains search patterns or wildcards, return a
     * set of Descriptors for all existing Definitions who have source that
     * exists. Does not compile the definitions if they were not already
     * compiled, and does not guarantee that they can compile.
     */
    <D extends Definition> Set<DefDescriptor<D>> find(DefDescriptor<D> matcher);

    /**
     * Given a string that contains search patterns or wildcards, return a set
     * of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and
     * does not guarantee that they can compile.
     */
    Set<DefDescriptor<?>> find(DescriptorFilter matcher);

    /**
     * Returns true if the source related to the descriptor exists. Does not
     * compile the definition if it was not already compiled, and does not
     * guarantee that it can compile.
     */
    <D extends Definition> boolean exists(DefDescriptor<D> descriptor);

    /**
     * Add a local definition to the registry.
     * 
     * The definition to be added must have a descriptor that matches the
     * definition.
     */
    <D extends Definition> void addLocalDef(D def);

    /**
     * Get the source for a given descriptor.
     */
    <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor);

    /**
     * Check to see if a namespace exists.
     */
    boolean namespaceExists(String ns);

    /**
     * assert that we have access to the definition given by a descriptor.
     */
    void assertAccess(DefDescriptor<?> desc) throws QuickFixException;

    /**
     * Filter our loaded set of dependencies on the preloads.
     * 
     * This filters the set of definitions currently loaded in the master def
     * registry on the set of preloads given. This allows for definitions to be
     * loaded with {@link getDef(DefDescriptor)} then filtered here for
     * preloads. The resulting map of definitions is the complete set that has
     * not been preloaded.
     * 
     * @param preloads The set of preloaded definitions.
     * @return the full set of loaded definitions not included in the preload.
     */
    Map<DefDescriptor<? extends Definition>, Definition> filterRegistry(Set<DefDescriptor<?>> preloads);

    /**
     * Invalidate a descriptor in the cache.
     *
     * This method is only definitive for the local cache. See the class comment.
     *
     * @param descriptor the descriptor.
     */
    <T extends Definition> boolean invalidate(DefDescriptor<T> descriptor);

    /**
     * Get the UID associated with a descriptor.
     * 
     * This call must be made before any of the other UID based functions.
     * Failing to do so will give incorrect results (null).
     * 
     * @param uid the old uid (or null if none).
     * @param descriptor the top level descriptor for which we need the UID.
     * @return Either the uid passed in, or if that was null, the correct UID
     * @throws ClientOutOfSyncException if the UID is not null, and was a mismatch
     * @throws QuickFixException if the definition cannot be compiled.
     */
    <T extends Definition> String getUid(String uid, DefDescriptor<T> descriptor) throws ClientOutOfSyncException,
            QuickFixException;

    /**
     * Get the last mod time for set of descriptors.
     * 
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     * @param descriptor the descriptor.
     */
    <T extends Definition> long getLastMod(String uid);

    /**
     * Get the dependencies for a descriptor.
     * 
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     * @param descriptor the descriptor.
     */
    <T extends Definition> Set<DefDescriptor<?>> getDependencies(String uid);

    /**
     * Get a named string from the cache for a def.
     * 
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     * @param descriptor the descriptor.
     * @param key the key.
     */
    <T extends Definition> String getCachedString(String uid, DefDescriptor<?> descriptor, String key);

    /**
     * Put a named string in the cache for a def.
     * 
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     * @param descriptor the descriptor.
     * @param key the key (must be unique).
     * @param key the value to store.
     */
    <T extends Definition> void putCachedString(String uid, DefDescriptor<?> descriptor, String key, String value);
}
