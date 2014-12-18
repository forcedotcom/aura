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
package org.auraframework.adapter;

import org.auraframework.def.JavaControllerDef;
import org.auraframework.def.JavaModelDef;
import org.auraframework.def.JavaProviderDef;

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * An interface to create bean versions of objects used by aura.
 *
 * This interface should be implemented when the method for creating
 * beans is different than the default aura method (class instantiation).
 * For example, if you are using Spring, you would override this to use
 * spring to instantiate and inject dependencies.
 */
public interface BeanAdapter extends AuraAdapter {
    /**
     * Validate a bean for a model.
     *
     * This should validate the model and throw an exception if there is a problem with it.
     *
     * @param def the definition to validate
     * @throws QuickFixException if there is an error in the validation.
     */
    void validateModelBean(JavaModelDef def) throws QuickFixException;

    /**
     * Get a bean for a model.
     *
     * This method should return a different bean for each call, as it
     * will be called on instantiation of the model, and by definition,
     * the models should be unique to the current component.
     *
     * @param def the definition for the model (including the expected class)
     * @return a bean representing the model.
     */
    Object getModelBean(JavaModelDef def);

    /**
     * Validate a bean for a controller.
     *
     * @param def the definition to validate
     * @throws QuickFixException if there is an error in the validation.
     */
    void validateControllerBean(JavaControllerDef def) throws QuickFixException;

    /**
     * Get a bean for a controller.
     *
     * This method can return the same bean for all calls within a single context
     * (i.e. request). Controllers cannot assume that each action is called on
     * a new bean, but rather should assume that the use context is the same. If
     * this is not the case, a static controller (with no state) should be used
     * to enforce the contract.
     *
     * The implementing adapter can define if it is single instance or multi-instance.
     *
     * @param def the controller def for which we need a bean
     * @return a bean that is tied to the current context.
     */
    Object getControllerBean(JavaControllerDef def);
    
    /**
     * Validate a bean for a provider.
     *
     * @param def the definition to validate
     * @param clazz the class to validate.
     * @throws QuickFixException if there is an error in the validation.
     */
    void validateProviderBean(JavaProviderDef def, Class<?> clazz) throws QuickFixException;

    /**
     * Get a bean for a provider.
     *
     * This method can return the same bean for all calls within a single context
     * (i.e. request). Providers cannot assume that each call is on a new bean,
     * but rather should assume that the use context is the same.
     *
     * The implementing adapter can define if it is single instance or multi-instance.
     *
     * @param T the type of the provider to return
     * @param def the provider def for which we need a bean
     * @param clazz the class to return.
     * @return a bean that is tied to the current context.
     */
    <T> T getProviderBean(JavaProviderDef def, Class<T> clazz);
}
