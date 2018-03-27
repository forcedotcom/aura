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
package org.auraframework.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.InterfaceDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.system.Source;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * <p>
 * Service for loading, finding or interacting with a {@link Definition}.
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}
 * </p>
 */
public interface DefinitionService extends AuraService {

    /**
     * <p>
     * Create a {@link DefDescriptor} that describes a named {@link Definition}
     * </p>
     * <p>
     * The class must be retrieved from DefDescriptor.DefType.getPrimaryInterface()
     * </p>
     *
     * @param qualifiedName the name of the Definition
     * @param defClass The Interface of the type of definition you are trying to
     *            describe.
     * @return a descriptor. Never returns null.
     */
    <T extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass);

    /**
     * <p>
     * Create a {@link DefDescriptor} that describes a named {@link Definition}
     * </p>
     * <p>
     * The class must be retrieved from DefDescriptor.DefType.getPrimaryInterface()
     * </p>
     *
     * @param qualifiedName the name of the Definition
     * @param defClass The Interface of the type of definition you are trying to
     *            describe.
     * @param bundle the bundle for which the descriptor is valid
     * @return a descriptor. Never returns null.
     */
    <T extends Definition, B extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass, DefDescriptor<B> bundle);

    /**
     * <p>
     * Create a {@link DefDescriptor} that has the same namespace and name as the provided descriptor but a different
     * DefType and prefix.
     * </p>
     * <p>
     * The class must be retrieved from DefDescriptor.DefType.getPrimaryInterface()
     * </p>
     *
     * @param desc the descriptor of the Definition
     * @param defClass The Interface of the type of definition you are trying to
     *            describe.
     * @return a descriptor. Never returns null.
     */
    <T extends Definition> DefDescriptor<T> getDefDescriptor(DefDescriptor<?> desc, String prefix, Class<T> defClass);

    DefDescriptor<?> getDefDescriptor(String prefix, String namespace, String name, DefType defType);

    /**
     * Get the Definition associated with the descriptor passed in, compiling if
     * necessary.
     *
     * @param descriptor the descriptor to get/compile
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     * @throws QuickFixException
     */
    <T extends Definition> T getDefinition(DefDescriptor<T> descriptor) throws DefinitionNotFoundException,
    QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns it.
     *
     * FIXME: some callers use a descriptorName instead of a qualifiedName here!
     *
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     * @throws QuickFixException
     */
    <T extends Definition> T getDefinition(String qualifiedName, Class<T> defType) throws DefinitionNotFoundException,
    QuickFixException;

    /**
     * Return the definition for this descriptor, or null if it does not exist.
     *
     * If the definition was not already compiled, this method will cause it to
     * be compiled before it is returned. The difference with getDefinition is that it will not
     * load all of the dependent defs, and thus will _not_ load the def into the request local cache.
     *
     * Use with care.
     *
     * @param descriptor the descriptor to find.
     * @return the corresponding definition, or null if it doesn't exist.
     * @throws QuickFixException if there is a compile time error.
     */
    <D extends Definition> D getUnlinkedDefinition(DefDescriptor<D> descriptor) throws QuickFixException;

    /**
     * Returns true if the source related to the descriptor exists. Does not
     * compile the definition if it was not already compiled, and does not
     * guarantee that it can compile.
     */
    <D extends Definition> boolean exists(DefDescriptor<D> descriptor);

    /**
     * Get the source for a given descriptor.
     */
    <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor);

    /**
     * Given a string that contains search patterns or wildcards, return a set
     * of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and
     * does not guarantee that they can compile.
     *
     * @param matcher the matcher to find descriptors
     * @param referenceDescriptor if matcher contains a wildcard, will be used to filter matches based on access
     */
    Set<DefDescriptor<?>> find(DescriptorFilter matcher, BaseComponentDef referenceDescriptor);

    /**
     * Find the set of components that have a tag.
     *
     * For a component to be returned here, it must implement the PlatformDef interface
     * and have one of the tags passed in.
     *
     * @param tags the set of requested tags (any tag suffices)
     * @return the set of descriptors for defs that match.
     * @deprecated use #findByTags(null, tags)
     */
    @Nonnull
    default Set<DefDescriptor<?>> findByTags(@Nonnull Set<String> tags) { return findByTags(null, tags);};

    /**
     * Find the set of components that have a tag.
     *
     * For a component to be returned here, it must implement the PlatformDef interface
     * and have one of the tags passed in.
     *
     * @param namespace a set of namespaces by which to filter the search, null means do not filter.
     * @param tags the set of requested tags (any tag suffices)
     * @return the set of descriptors for defs that match.
     */
    @Nonnull
    Set<DefDescriptor<?>> findByTags(Set<String> namespaces, @Nonnull Set<String> tags);

    /**
     * Given a string that contains search patterns or wildcards, return a set
     * of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and
     * does not guarantee that they can compile.
     *
     * @param matcher the matcher to find descriptors
     */
    default Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        return this.find(matcher, null);
    }

    /**
     * update the set of loaded descriptors, and validate.
     *
     * @param loading the descriptor that we are loading if any.
     * @throws ClientOutOfSyncException if one of the defs is out of date.
     * @throws QuickFixException if a definition can't be compiled.
     */
    void updateLoaded(DefDescriptor<?> loading) throws QuickFixException, ClientOutOfSyncException;

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
     * Get the dependencies for a descriptor.
     *
     * This set is guaranteed to be in order of 'use' in that a component should come before
     * all components that use it or depend on it.
     *
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     */
    Set<DefDescriptor<?>> getDependencies(String uid);

    /**
     * Returns list of client libraries for given uid
     *
     * @param uid uid of app or cmp
     * @return list of client libraries for uid
     */
    List<ClientLibraryDef> getClientLibraries(String uid);

    /**
     * Get a usage map for a global value provider based on the uid.
     *
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     * @param root the root for the global value provider.
     * @return a usage map.
     */
    Set<PropertyReference> getGlobalReferences(String uid, String root);

    /**
     * Check to see if the dependency set is cacheable or not.
     *
     * This is really about wether we expect the definition to change. If not, we can cache based on
     * descriptor rather than uid, and we can expect those to be 'permanent'. If the entry is not
     * cacheable, the UID should still give us the ability to cache, but we must be carefull about permanence,
     * as the defintion may be dynamic.
     */
    boolean isDependencySetCacheable(String uid);

    /**
     * assert that the referencingDescriptor has access to the definition.
     *
     * @param referencingDescriptor the descriptor of the component referencing the definition.
     * @param def the definition being referenced.
     * @throws QuickFixException if the reference is not allowed
     */
    <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, D def) throws QuickFixException;

    /**
     * assert that the referencingDescriptor has access to the definition.
     *
     * @param referencingDescriptor the descriptor of the component referencing the definition.
     * @param accessDescriptor a descriptor for a definition being accessed.
     * @throws QuickFixException if the reference is not allowed
     */
    <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor) throws QuickFixException;

    /**
     * Populate a global value provider from references in a set of definitions.
     *
     * This routine will populate the global value provider, and capture any errors during the process. If
     * errors occur, it will throw an exception which will be a composite exception of all errors.
     *
     * @param root the root name of the GVP.
     * @param definitionMap A map of descriptor to definition that defines the set of definitions to use.
     * @throws QuickFixException if any errors occurred, the exception will be thrown after the entire set is processed
     */
    void populateGlobalValues(String root, Map<DefDescriptor<? extends Definition>, Definition> definitionMap)
        throws QuickFixException;

    /**
     * Retrieve a set of references to a global value provider, validating them.
     *
     * This routine will fetch the set of global value provider references for a given root, validating each one,
     * and throwing a composite error if validation fails.
     *
     * @param root the root name of the GVP.
     * @param definitionMap A map of descriptor to definition that defines the set of definitions to use.
     * @throws QuickFixException if any errors occurred, the exception will be thrown after the entire set is processed
     */
    Set<String> getGlobalReferences(String root, Map<DefDescriptor<? extends Definition>, Definition> definitionMap)
        throws QuickFixException;

    /**
     * Returns null if the referencingDescriptor has access to the definition otherwise a specific access violation reason.
     */
    boolean hasAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor) throws QuickFixException;

    <D extends Definition> boolean hasAccess(DefDescriptor<?> referencingDescriptor, D def) throws QuickFixException;

    /**
     * @param descriptor
     * @param interfaceDef
     * @return true if the definition or it's parent (extends) definitions contain the interface
     * @throws QuickFixException
     */
    boolean hasInterface(DefDescriptor<? extends BaseComponentDef> descriptor, DefDescriptor<InterfaceDef> interfaceDef) throws QuickFixException;

    /**
     * make sure all of our registries are built.
     */
    void warmCaches();
}
