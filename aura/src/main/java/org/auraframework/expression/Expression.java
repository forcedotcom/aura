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
package org.auraframework.expression;

import java.io.Serializable;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.instance.ValueProvider;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * An expression that can be evaluated on the server or the client.
 */
public interface Expression extends Serializable {

    /**
     * Evaluate this expression and return the result, resolving references
     * against the passed in value provider.
     */
    Object evaluate(ValueProvider vp) throws QuickFixException;

    /**
     * @return the enum of the type of this expression
     */
    ExpressionType getExpressionType();

    /**
     * @return descriptor for the type that this expression will return (for
     *         validation)
     */
    DefDescriptor<TypeDef> getReturnTypeDef();

    // void validate(ValueProvider vp) throws Something;

    /**
     * @return location where it was defined
     */
    Location getLocation();

    /**
     * Gathers up all the property references in this expression
     * 
     * @param propRefs set to add them to
     */
    void gatherPropertyReferences(Set<PropertyReference> propRefs);
}
