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
import org.auraframework.def.DescriptorFilter;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Master Definition Registry.
 * 
 * All other (type-specific) registries are delegated to by a master def
 * registry. The master definition registry handles all of the compilation and
 * cross registry references.
 */
public interface MasterDefRegistry {

    /**
     * Return the definition for this descriptor, or null if it does not exist.
     * 
     * If the definition was not already compiled, this method will cause it to
     * be compiled before it is returned. Any dependent definitions will be
     * loaded.
     * 
     * @throws QuickFixException if there is a problem during compilation.
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
}
