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
package org.auraframework.ds.servicecomponent;

/**
 * ServiceComponent instance loader interface
 */
public interface ServiceComponentInstanceLoader {
    /**
     * Loads ModelInstance by its class name
     * 
     * @param className model class name
     * @return model instance
     */
    ModelInstance getModelInstance(String className);

    /**
     * Loads Controller singleton by its class name
     * 
     * @param className controller class name
     * @return controller singleton
     */
    Controller getControllerInstance(String className);

    /**
     * Loads Provider singleton by its class name
     * 
     * @param className provider class name
     * @return provider singleton
     */
    Provider getProviderInstance(String className);

    /**
     * Loads Access singleton by its class name
     * TODO: this is still work in progress
     * 
     * @param className access class name
     * @return access singleton
     */
    Access getAccessInstance(String className);
}
