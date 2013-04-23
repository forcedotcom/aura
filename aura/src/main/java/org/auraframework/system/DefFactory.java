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

import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A factory that produces Definitions of a particular type. It is not safe for
 * a DefRegistry to cache the returned definitions. DefFactories that do produce
 * Definitions that are safe to cache should instead implement
 * CacheableDefFactory.
 */
public interface DefFactory<D extends Definition> {
    /**
     * Return the definition for this descriptor, or null if it does not exist.
     * This method will compiled the definition and then return it.
     * 
     * @throws QuickFixException
     */
    D getDef(DefDescriptor<D> descriptor) throws QuickFixException;

    /**
     * Return true if the find methods work.
     * 
     * @return true if find will not throw 'UnsupportedOperationException'
     */
    boolean hasFind();

    /**
     * Given a descriptor that contains search patterns or wildcards, return a
     * set of Descriptors for all existing Definitions who have source that
     * exists. Does not compile the definitions if they were not already
     * compiled, and does not guarantee that they can compile.
     */
    Set<DefDescriptor<D>> find(DefDescriptor<D> matcher);

    /**
     * Given a string that contains search patterns or wildcards, return a set
     * of Descriptors for all existing Definitions who have source that exists.
     * Does not compile the definitions if they were not already compiled, and
     * does not guarantee that they can compile.
     */
    Set<DefDescriptor<?>> find(DescriptorFilter matcher);

    /**
     * Save the given definition back to appropriate primary source location.
     */
    void save(D def);

    /**
     * Returns true if the source related to the descriptor exists. Does not
     * compile the definition, and does not guarantee that it can compile.
     */
    boolean exists(DefDescriptor<D> descriptor);

    /**
     * Saves alternate representations of the Component (like generated java
     * classes)
     */
    void synchronize(D def);

    Source<D> getSource(DefDescriptor<D> descriptor);

    /**
     * Returns a Set of namespaces for which this factory is authoritative.
     */
    Set<String> getNamespaces();
}
