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

import java.io.Serializable;
import java.util.Set;

import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonSerializable;

/**
 * Define something.
 *
 * Notes to implementors.
 * 
 * Exceptions should not be thrown except where explicitly declared during the validation
 * process. This means that no exceptions should be thrown in a constructor or in
 * {@link #appendDependencies()}. You can use {@link #validateDefinition()} and
 * {@link #validateReferences()} to throw exceptions as a {@link QuickFixException}.
 *
 * Also note that as part of the contract, you may not call any routine intended to get
 * a definition until {@link #validateReferences()}. This includes the constructor,
 * {@link #appendDependencies()} and {@link #validateDefinition()}.
 */
public interface Definition extends JsonSerializable, Serializable {

    /**
     * First pass validation, validates this definition locally.
     *
     * You may not validate any references, or make any calls that would get
     * a definition from aura. If there are any captured errors from the build
     * phase, they will be thrown here.
     *
     * Also note, you MUST call Definition.validateDefinition() from any overrides.
     *
     * @throws QuickFixException if there is a problem with the local definition.
     */
    void validateDefinition() throws QuickFixException;

    /**
     * Adds all the descriptors for all definitions this depends on to the set.
     *
     * This function MUST append descriptors for any dependencies that will be
     * fetched in validateReferences(). If they are not appended here, an exception
     * will be thrown during the compile.
     *
     * This is always called before validateReferences.
     *
     * @param dependencies the set to which we should append.
     */
    void appendDependencies(Set<DefDescriptor<?>> dependencies);

    /**
     * Second pass validation, which validates any references to other
     * definitions which might not be in the cache yet.
     *
     * Any definitions needed can be fetched here, and arbitrary validation
     * may be performed. Anything referenced here must have been included
     * in the dependencies above. Note that anything in the dependencies
     * does not need a recursive call to validateReferences, since the compile
     * will take care of that.
     * 
     * @throws QuickFixException if there is a problem with a reference
     */
    void validateReferences() throws QuickFixException;

    /**
     * Final validation marker.
     * 
     * When this is called, all definitions in the manifest of definitions have
     * been validated. At this point the definition is about to be put in cache
     * if it can be cached.
     */
    void markValid();

    /**
     * Has this definition been marked as valid?.
     */
    boolean isValid();

    /**
     * @return the name of this definition, not necessarily unique
     */
    String getName();

    /**
     * @return the location where this definition was defined
     */
    Location getLocation();

    // Visibility is deprecated: replaced by ACCESS=global/public/private
    @Deprecated
    public enum Visibility{
        PRIVATE,PUBLIC,INVALID
    };

    Visibility getVisibility();
    
    DefinitionAccess getAccess(); 

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
    <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor);

    /**
     * retrieve all labels needed by this definition. FIXME: this should be more
     * like append dependencies so that we can build a set before retrieving
     * any. that way we'd be much more efficient.
     */
    void retrieveLabels() throws QuickFixException;

    /**
     * Get a readable description of this definition.
     */
    String getDescription();

    /**
     * Get the API Version of this definition.
     */
    String getAPIVersion();

    /**
     * Fetches a non-recursive hash for this definition's contents. This does
     * not incorporate hash of dependent definitions, which are generally
     * context-dependent (in that providers may give different users different
     * dependencies for the same parent definition).
     */
    String getOwnHash();

    /**
     * Adds supers of this definition to the list.
     */
    void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException;
}
