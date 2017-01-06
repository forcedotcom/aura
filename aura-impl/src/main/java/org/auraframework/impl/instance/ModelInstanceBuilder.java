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
package org.auraframework.impl.instance;

import java.util.Map;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.def.JavaModelDef;
import org.auraframework.def.ModelDef;
import org.auraframework.ds.servicecomponent.ModelFactory;
import org.auraframework.ds.servicecomponent.ModelInitializationException;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.impl.java.model.JavaModelDefImpl;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.instance.InstanceBuilderProvider;
import org.auraframework.instance.Model;
import org.auraframework.service.ContextService;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraRuntimeException;

@ServiceComponent
public class ModelInstanceBuilder implements InstanceBuilder<Model, ModelDef> {

    @Inject
    private ContextService contextService;

    @Inject
    private LoggingService loggingService;

    @Inject
    private InstanceBuilderProvider instanceBuilderProvider;

    @Override
    public Class<?> getDefinitionClass() {
        return JavaModelDefImpl.class;
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Model getInstance(ModelDef modelDef, Map<String, Object> attributes) {
        Class<?> clazz = ((JavaModelDef) modelDef).getJavaType();
        boolean isServiceComponentModelInstance = clazz.getAnnotation(ServiceComponentModelInstance.class) != null;
        Object bean = null;

        if (isServiceComponentModelInstance) {
            try {
                String modelFactoryClassName = clazz.getName() + "Factory";
                @SuppressWarnings("unchecked")
                Class<? extends ModelFactory> modelFactoryClass = (Class<? extends ModelFactory>) Class
                        .forName(modelFactoryClassName);
                Object instance;
                try {
                    instance = instanceBuilderProvider.get(modelFactoryClass);
                } catch (Throwable t) {
                    throw new AuraRuntimeException(
                            "Failed to retrieve model instance for " + modelDef.getDescriptor(), t);
                }
                if (instance instanceof ModelFactory) {
                    bean = ((ModelFactory) instance).modelInstance();
                }
            } catch (ClassNotFoundException e) {
                throw new AuraRuntimeException("Factory class could not be found", e);
            } catch (ModelInitializationException e) {
                throw new AuraRuntimeException("Factory failed to create model instance", e);
            }
        } else {
            try {
                bean = clazz.newInstance();
            } catch (InstantiationException | IllegalAccessException e) {
                throw new AuraExecutionException(e.getMessage(), modelDef.getLocation(), e);
            }
        }

        return new JavaModel((JavaModelDefImpl) modelDef, bean, contextService, loggingService);
    }
}
