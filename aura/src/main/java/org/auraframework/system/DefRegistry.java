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

import java.io.Serializable;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Public interface for retrieving aura definitions to be implemented by the cache.
 * This is exposed through aura context, all loading and caching is hidden in the implmentations.
 */
public interface DefRegistry<T extends Definition> extends Serializable {

    /**
     * Return the definition for this descriptor, or null if it does not exist.
     *
     * This will only load the definition, it will not fully compile it. Until it
     * has been put back into the registry with a call to 'validated', it will not
     * be cached.
     *
     * @throws QuickFixException
     */
    T getDef(DefDescriptor<T> descriptor) throws QuickFixException;

    /**
     * Mark this definition as validated.
     *
     * It is an error to call this function with a definition that was not
     * retrieved from this same registry.
     */
    void markValid(DefDescriptor<T> descriptor, T def);

    /**
     * Return true if the find methods work.
     *
     * @return true if find will not throw 'UnsupportedOperationException'
     */
    boolean hasFind();

    /**
     * Given a descriptor that contains search patterns or wildcards, return a
     * set of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and does
     * not guarantee that they can compile.
     */
    Set<DefDescriptor<T>> find(DefDescriptor<T> matcher);

    /**
     * Given a string that contains search patterns or wildcards, return a
     * set of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and does
     * not guarantee that they can compile.
     */
    Set<DefDescriptor<?>> find(DescriptorFilter matcher);

    /**
     * Save the given definition back to appropriate source location.
     */
    void save(T def);

    /**
     * Returns true if the source related to the descriptor exists.  Does not
     * compile the definition if it was not already compiled, and does not guarantee
     * that it can compile.
     */
    boolean exists(DefDescriptor<T> descriptor);

    /**
     * The DefTypes that this registry handles (returns)
     */
    Set<DefType> getDefTypes();

    /**
     * The Prefixes that this registry handles
     */
    Set<String> getPrefixes();

    /**
     * Returns a Set of namespaces for which this registry is authoritative.  "*" indicates that the registry
     * should be used when no other registry has registered for a namespace.
     */
    Set<String> getNamespaces();

    Source<T> getSource(DefDescriptor<T> descriptor);

    /**
     * Clear this registry of all defs it might be storing
     */
    void clear();
}
