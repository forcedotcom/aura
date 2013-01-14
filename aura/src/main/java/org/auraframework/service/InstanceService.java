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

import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.instance.Instance;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * <p>
 * Service for constructing an {@link Instance} of a {@link Definition}
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}
 * </p>
 */
public interface InstanceService extends AuraService {

    /**
     * Get the an Instance of the Definition associated with the descriptor
     * passed in.
     * 
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor)
            throws DefinitionNotFoundException, QuickFixException;

    /**
     * Get the an Instance of the Definition associated with the descriptor
     * passed in, using the map of attributes to initialize the instance.
     * 
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor,
            Map<String, Object> attributes) throws DefinitionNotFoundException, QuickFixException;

    /**
     * Get the an Instance of the Definition passed in.
     * 
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(D definition) throws DefinitionNotFoundException,
            QuickFixException;

    /**
     * Get the an Instance of the Definition passed in, using the map of
     * attributes to initialize the instance.
     * 
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(D definition, Map<String, Object> attributes)
            throws DefinitionNotFoundException, QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns an in Instance of it.
     * 
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass)
            throws DefinitionNotFoundException, QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns an in Instance of it,
     * using the map of Attributes to initialize the instance.
     * 
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass,
            Map<String, Object> attributes) throws DefinitionNotFoundException, QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns an instance of it. This
     * method should only be used if the caller doesn't know or care what type
     * is returned.
     * 
     * @param defTypes a list of DefTypes to check
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    Instance<?> getInstance(String qualifiedName, DefType... defTypes) throws DefinitionNotFoundException,
            QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns an instance of it. This
     * method should only be used if the caller doesn't know or care what type
     * is returned. Uses the supplied map of attributes to initialize the
     * Instance.
     * 
     * @param defTypes a list of DefTypes to check
     * @return The named definition
     * @throws DefinitionNotFoundException if definition does not exist
     */
    Instance<?> getInstance(String qualifiedName, Map<String, Object> attributes, DefType... defTypes)
            throws DefinitionNotFoundException, QuickFixException;
}
