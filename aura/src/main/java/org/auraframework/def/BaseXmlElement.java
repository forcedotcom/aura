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

import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.io.Serializable;
import java.util.Set;

/**
 * Represents an xml element, a definition-less representation of xml.
 */
public interface BaseXmlElement extends Serializable {
    /**
     * First pass validation, validates this definition locally.
     * <p>
     * You may not validate any references, or make any calls that would get
     * a definition from aura. If there are any captured errors from the build
     * phase, they will be thrown here.
     * <p>
     * Also note, you MUST call Definition.validateDefinition() from any overrides.
     *
     * @throws QuickFixException if there is a problem with the local definition.
     */
    void validateDefinition() throws QuickFixException;

    /**
     * Adds all the descriptors for all definitions this depends on to the set.
     * <p>
     * This function MUST append descriptors for any dependencies that will be
     * fetched in validateReferences(). If they are not appended here, an exception
     * will be thrown during the compile.
     * <p>
     * This is always called before validateReferences.
     *
     * @param dependencies the set to which we should append.
     */
    void appendDependencies(Set<DefDescriptor<?>> dependencies);

    /**
     * Adds all the descriptors for all definitions this depends on to the set.
     * <p>
     * This function MUST append descriptors for any dependencies that will be
     * fetched in validateReferences(). If they are not appended here, an exception
     * will be thrown during the compile.
     * <p>
     * This is always called before validateReferences.
     *
     * @param dependencies the set to which we should append.
     * @param referenceDescriptor if provided will filter matched dependencies based on access when wildcard matches are used
     */
    default void appendDependencies(Set<DefDescriptor<?>> dependencies, BaseComponentDef referenceDescriptor) {
        this.appendDependencies(dependencies);
    }

    /**
     * Second pass validation, which validates any references to other
     * definitions which might not be in the cache yet.
     * <p>
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
     * <p>
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

    /**
     * @return the access permisions for this definition.
     */
    DefinitionAccess getAccess();

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
