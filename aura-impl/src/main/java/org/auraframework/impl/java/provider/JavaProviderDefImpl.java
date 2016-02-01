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
package org.auraframework.impl.java.provider;

import java.io.IOException;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDescriptorProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.JavaProviderDef;
import org.auraframework.def.Provider;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.StaticComponentConfigProvider;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class JavaProviderDefImpl extends DefinitionImpl<JavaProviderDef> implements JavaProviderDef {
    private static final long serialVersionUID = -4972842636058759316L;
    private final Class<ComponentConfigProvider> configProvider;
    private final Class<StaticComponentConfigProvider> staticConfigProvider;
    private final Class<ComponentDescriptorProvider> descriptorProvider;

    protected JavaProviderDefImpl(Builder builder) throws QuickFixException {
        super(builder);
        this.configProvider = builder.configProvider;
        this.staticConfigProvider = builder.staticConfigProvider;
        this.descriptorProvider = builder.descriptorProvider;
    }

    /**
     * Validate our definition.
     * 
     * This validation ensures that we have a provider method to get either a descriptor (simple case) or a config
     * (complex case). It also refuses to allow a method by the name of provideAttributes.
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (configProvider == null && descriptorProvider == null) {
            throw new InvalidDefinitionException("@Provider must have a provider interface.", location);
        }
    }

    @Override
    public ComponentConfig provide(DefDescriptor<? extends RootDefinition> intfDescriptor) throws QuickFixException {
        ComponentConfig config = null;
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        try {
            if (configProvider != null) {
                config = configProvider.newInstance().provide();
                loggingService.incrementNum("JavaCallCount");
            } else if (descriptorProvider != null) {
                config = new ComponentConfig();
                config.setDescriptor(descriptorProvider.newInstance().provide());
                loggingService.incrementNum("JavaCallCount");
            }
        } catch (Exception e) {
            throw AuraExceptionUtil.wrapExecutionException(e, this.location);
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }

        return config;
    }

    @Override
    public ComponentConfig provide(ComponentDefRefBuilder ref) throws QuickFixException {
        ComponentConfig config = null;
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");

        try {
            config = staticConfigProvider.newInstance().provide(ref);
            loggingService.incrementNum("JavaCallCount");
        } catch (Exception e) {
            throw AuraExceptionUtil.wrapExecutionException(e, this.location);
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }

        return config;
    }

    @Override
    public boolean supportsRefProvide() {
        return true;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public boolean isLocal() {
        return true;
    }

    public static final class Builder extends AbstractJavaProviderDef.Builder<JavaProviderDef> {
        private Class<ComponentConfigProvider> configProvider = null;
        private Class<StaticComponentConfigProvider> staticConfigProvider = null;
        private Class<ComponentDescriptorProvider> descriptorProvider = null;

        public Builder() {
            super(JavaProviderDef.class);
        }

        @SuppressWarnings("unchecked")
        private void getClasses() {
            Class<?> pClazz = getProviderClass();
            List<Class<? extends Provider>> interfaces = AuraUtil.findInterfaces(pClazz, Provider.class);
            for (Class<? extends Provider> theIfc : interfaces) {
                if (ComponentConfigProvider.class.isAssignableFrom(theIfc)) {
                    configProvider = (Class<ComponentConfigProvider>) pClazz;
                } else if (ComponentDescriptorProvider.class.isAssignableFrom(theIfc)) {
                    descriptorProvider = (Class<ComponentDescriptorProvider>) pClazz;
                }
                if (StaticComponentConfigProvider.class.isAssignableFrom(theIfc)) {
                    staticConfigProvider = (Class<StaticComponentConfigProvider>) pClazz;
                }
            }
        }

        @Override
        public JavaProviderDef build() throws QuickFixException {
            getClasses();
            return new JavaProviderDefImpl(this);
        }
    }
}
