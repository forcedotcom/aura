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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.Provider;
import org.auraframework.def.ProviderDef;
import org.auraframework.impl.java.provider.JavaProviderDefImpl;
import org.auraframework.impl.java.provider.JavaProviderInstance;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.instance.ProviderInstance;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import javax.inject.Inject;
import java.util.Map;

@ServiceComponent
public class ProviderInstanceBuilder implements InstanceBuilder<ProviderInstance, ProviderDef>, ApplicationContextAware {

    @Inject
    LoggingService loggingService;

    private ApplicationContext applicationContext;

    @Override
    public Class<?> getDefinitionClass() {
        return JavaProviderDefImpl.class;
    }

    @Override
    public ProviderInstance getInstance(ProviderDef providerDef, Map<String, Object> attributes) throws QuickFixException {
        Object instance = applicationContext.getBean(providerDef.getJavaType());
        if (instance instanceof Provider) {
            return new JavaProviderInstance(providerDef, (Provider) instance, loggingService);
        }

        return null;
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

}
