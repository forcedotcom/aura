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

import org.auraframework.expression.PropertyReference;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.validation.ReferenceValidationContext;

import java.util.Collection;
import java.util.Set;

import javax.annotation.CheckForNull;

/**
 * Define something.
 *
 * Notes to implementors.
 * 
 * Exceptions should not be thrown except where explicitly declared during the validation
 * process. This means that no exceptions should be thrown in a constructor or in
 * {@link BaseXmlElement#appendDependencies(Set)}. You can use {@link #validateDefinition()} and
 * {@link #validateReferences(ReferenceValidationContext)} to throw exceptions as a {@link QuickFixException}.
 *
 * Also note that as part of the contract, you may not call any routine intended to get
 * a definition until {@link #validateReferences(ReferenceValidationContext)}. This includes the constructor,
 * {@link BaseXmlElement#appendDependencies(Set)} and {@link #validateDefinition()}.
 */
public interface Definition extends JsonSerializable, BaseXmlElement {

    /**
     * Get the descriptor. Note that this _should_ be non-null, but it is not,
     * because there are definitions that cannot be described (references and
     * event handlers are example cases). This could be handled by having yet
     * another layer, and defining an interface for a localized definition that
     * has no descriptor (a superclass of this), defining all other functions.
     * The descriptor here, if non-null should be equal to the descriptor used
     * to retrieve this definition and getDef() should return either the same
     * definition or a newer version of it. Within a request, desc.getDef() ==
     * desc.getDef.().getDescriptor().getDef().
     * 
     * @return the descriptor for this definition
     */
    DefDescriptor<? extends Definition> getDescriptor();

    /**
     * Get a sub definition for this definition. Typing here is a little off,
     * the second type parameter should be the actual type of this definition,
     * but to avoid circular definitions we drop that here.
     * 
     * @param descriptor the descriptor for the sub-definition.
     * @return the definition that matches the descriptor.
     */
    @CheckForNull
    <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor);

    /**
     * Get the set of property references for this definition.
     *
     * By default, we simply return null, implying that there are no property references.
     *
     * @return the set of property references or null if none
     */
    @CheckForNull
    default Collection<PropertyReference> getPropertyReferences() {
        return null;
    }
    
    /**
     * If the definition is generated on-the-fly and not from a source location
     * @return Boolean true if the definition did not come from a source
     */
    default boolean isDynamicallyGenerated() {
        return false;
    }
}
