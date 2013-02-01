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
package org.auraframework.service;

import java.util.Collection;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.MasterDefRegistry;
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
     * The class must be retrieved from
     * DefDescriptor.DefType.getPrimaryInterface()
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
     * Create a {@link DefDescriptor} that has the same namespace and name as
     * the provided descriptor but a different DefType and prefix.
     * </p>
     * <p>
     * The class must be retrieved from
     * DefDescriptor.DefType.getPrimaryInterface()
     * </p>
     * 
     * @param desc the descriptor of the Definition
     * @param defClass The Interface of the type of definition you are trying to
     *            describe.
     * @return a descriptor. Never returns null.
     */
    <T extends Definition> DefDescriptor<T> getDefDescriptor(DefDescriptor<?> desc, String prefix, Class<T> defClass);

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
     * retrieves the named Definition and then returns it. FIXME: some callers
     * use a descriptorName instead of a qualifiedName here!
     * 
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     * @throws QuickFixException
     */
    <T extends Definition> T getDefinition(String qualifiedName, Class<T> defType) throws DefinitionNotFoundException,
            QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns it. This method should
     * only be used if the caller doesn't know or care what type is returned.
     * 
     * @param defTypes a list of DefTypes to check
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     * @throws QuickFixException
     */
    Definition getDefinition(String qualifiedName, DefType... defTypes) throws DefinitionNotFoundException,
            QuickFixException;

    /**
     * Get the master def registry.
     * 
     * @return the master def registry.
     */
    MasterDefRegistry getDefRegistry();

    /**
     * [Temporary] Get the latest timestamp for a given descriptor.
     * 
     * This will check all dependencies of the definition.
     * 
     * @param descriptor the descriptor to check.
     */
    <T extends Definition> long getLastMod(DefDescriptor<T> desc) throws QuickFixException;
    
    /**
     * Get the latest timestamp for a given uid.
     * 
     * This will check all dependencies of the definition.
     * 
     * @param descriptor the descriptor to check.
     */
    long getLastMod(String uid) throws QuickFixException;

    /**
     * Given a set of preload namespaces, calculate the last mod time. This will
     * calculate the last mod time of a set of namespaces and all dependencies
     * of components/applications in that set of namespaces.
     * 
     * @throws QuickFixException
     */
    long getNamespaceLastMod(Collection<String> preloads) throws QuickFixException;

    /**
     * Given a {@link DefDescriptor} that contains search patterns or wildcards,
     * return a set of Descriptors for all existing Definitions who have source
     * that exists. Does not compile the definitions if they were not already
     * compiled, and does not guarantee that they can compile.
     * 
     * @throws QuickFixException
     */
    <D extends Definition> Set<DefDescriptor<D>> find(DefDescriptor<D> matcher) throws QuickFixException;

    /**
     * Given a string that contains search patterns or wildcards, return a set
     * of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and
     * does not guarantee that they can compile.
     * 
     * @throws QuickFixException
     */
    Set<DefDescriptor<?>> find(DescriptorFilter matcher) throws QuickFixException;

    /**
     * Save the given Definition back to source code.
     * 
     * @throws QuickFixException
     */
    void save(Definition def) throws QuickFixException;
}
