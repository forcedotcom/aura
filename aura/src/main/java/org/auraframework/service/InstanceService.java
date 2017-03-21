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
package org.auraframework.service;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionReference;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Instance;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Map;

/**
 * <p>
 * Service for constructing an {@link Instance} of a {@link Definition}
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link org.auraframework.Aura}
 * </p>
 */
public interface InstanceService extends AuraService {

    /**
     * Get the an Instance of the Definition associated with the descriptor
     * passed in.
     *
     * @return The named definition
     * @throws QuickFixException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor)
            throws QuickFixException;

    /**
     * Get the an Instance of the Definition associated with the descriptor
     * passed in, using the map of attributes to initialize the instance.
     *
     * @return The named definition
     * @throws QuickFixException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor,
            Map<String, Object> attributes) throws QuickFixException;

    /**
     * Get the an Instance of the Definition passed in.
     *
     * @return The named definition
     * @throws QuickFixException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(D definition) throws QuickFixException;

    /**
     * Get the an Instance of the Definition passed in, using the map of
     * attributes to initialize the instance.
     *
     * @return The named definition
     * @throws QuickFixException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(D definition, Map<String, Object> attributes)
            throws QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns an in Instance of it.
     *
     * @return The named definition
     * @throws QuickFixException this might throw AuraRuntimeException from BaseComponentImpl.injectComponent()
     */
    <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass)
            throws QuickFixException;

    /**
     * Creates a {@link DefDescriptor} from the qualified name passed in,
     * retrieves the named Definition and then returns an in Instance of it,
     * using the map of Attributes to initialize the instance.
     *
     * @return The named definition
     * @throws QuickFixException if definition does not exist
     */
    <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass,
            Map<String, Object> attributes) throws QuickFixException;

    /**
     * Create a new instance of a component using a passed in Component Definition Reference.
     *
     * @param defRef
     * @return
     */
    Instance<?> getInstance(ComponentDefRef defRef, BaseComponent<?, ?> valueProvider) throws QuickFixException;

    /**
     * Create a new instance of a component using a passed in Component Definition Reference.
     *
     * @param defRef
     * @return
     */
    Instance<?> getInstance(DefinitionReference defRef, BaseComponent<?, ?> valueProvider) throws QuickFixException;

}
