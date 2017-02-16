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

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A factory that produces Definitions of a particular type.
 *
 * This definition factory if selected by 3 parameters,
 * <ul>
 *   <li>The reference 'interface' which is an interface that defines
 *       the type of source that the factory uses. It really should be of type 'S", but java does not do well with
 *       generics. 
 *   <li>The Reference 'Type', which defines what the factory produces.
 *   <li>The mime type from the source, which tells you what is in the source for types that can be different data.
 * </ul>
 */
public interface DefinitionFactory<S extends Source<D>, D extends Definition> {
    /**
     * Get the reference interface for this factory.
     */
    Class<?> getReferenceInterface();

    /**
     * Get the reference type for this factory.
     */
    Class<D> getReferenceType();

    /**
     * Get the mime type that is handled by this factory.
     */
    String getMimeType();

    /**
     * Return the definition for a souce.
     *
     * The source should be non-null and exist.
     * 
     * @throws QuickFixException
     */
    D getDefinition(@CheckForNull DefDescriptor<D> descriptor, @Nonnull S source) throws QuickFixException;
}
