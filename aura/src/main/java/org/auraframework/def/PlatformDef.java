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
package org.auraframework.def;

import java.util.*;

import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.collect.ImmutableSet;

public interface PlatformDef extends BundleDef {

    enum SupportLevel {
        PROTO, DEPRECATED, BETA, GA
    }

    @Override
    DefDescriptor<? extends PlatformDef> getDescriptor();

    /**
     * @return all the attributes for this component, including those inherited from a super component
     * @throws QuickFixException
     */
    Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException;
    
    /**
     * @return the declared attributes for this component, not including those inherited from a super component
     */
    Map<DefDescriptor<AttributeDef>, AttributeDef> getDeclaredAttributeDefs();

    /**
     * @param name
     * @return The named AttributeDef
     * @throws QuickFixException
     */
    AttributeDef getAttributeDef(String name) throws QuickFixException;

    /**
     * Get the set of tags for this def.
     */
    default Set<String> getTags() { return Collections.emptySet(); };

    /**
     * Supported minimum version
     *
     * @return supported minimum version
     */
    Double getMinVersion();

    /**
     * Get the current support level for this def.
     */
    SupportLevel getSupport();

    /**
     * Flatten the hierarchy of this definition.
     *
     * Flattening is the process of bringing information from inherited classes
     * or interfaces into the subclass. It is done as part of linking. There is
     * an inherent assumption that a rolled up definition cannot change based
     * on context or other information. It must be declaratively defined.
     *
     * Note that each definition decides what should be flattened here, but the
     * general idea is that no recursion should happen after this call. And note
     * that this call is tightly coupled to the #getSupers() call on this class
     * which must return the full set of descriptors that are used here, and,
     * additionally, may not define cycles.
     *
     * @param linkerContext the context that contains all definitions accessible here.
     * @throws QuickFixException if something goes wrong when we try to flatten.
     */
    default void flattenHierarchy(ReferenceValidationContext linkerContext) throws QuickFixException {};

    /**
     * gets supers of this definition.
     *
     * The set of descriptors returned here must be the full set that is required by the flattenHierarchy
     * call.
     * 
     * @return the set of "supers"
     */
    default Set<DefDescriptor<?>> getSupers() { return ImmutableSet.of(); };
}
