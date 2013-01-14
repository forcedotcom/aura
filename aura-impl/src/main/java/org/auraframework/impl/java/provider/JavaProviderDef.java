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
package org.auraframework.impl.java.provider;

import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDescriptorProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Provider;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.StaticComponentConfigProvider;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class JavaProviderDef extends DefinitionImpl<ProviderDef> implements ProviderDef {

    // FIXME: this adaptor should die W-1190554
    private static class ConfigMethodAdaptor implements ComponentConfigProvider {
        private final Method configMethod;

        public ConfigMethodAdaptor(Method configMethod) {
            this.configMethod = configMethod;
        }

        @Override
        public ComponentConfig provide() {
            ComponentConfig config;

            try {
                config = (ComponentConfig) configMethod.invoke(null);
            } catch (Exception e) {
                throw new AuraRuntimeException(e);
            }
            return config;
        }
    }

    // FIXME: this adaptor should die W-1190554
    private static class DualMethodAdaptor implements ComponentConfigProvider {
        private final Method descriptorMethod;
        private final Method attributesMethod;

        public DualMethodAdaptor(Method descriptorMethod, Method attributesMethod) {
            this.descriptorMethod = descriptorMethod;
            this.attributesMethod = attributesMethod;
        }

        @SuppressWarnings("unchecked")
        @Override
        public ComponentConfig provide() {
            ComponentConfig config = new ComponentConfig();

            try {
                config.setDescriptor((DefDescriptor<ComponentDef>) descriptorMethod.invoke(null));
                if (attributesMethod != null) {
                    config.setAttributes((Map<String, Object>) attributesMethod.invoke(null));
                }
            } catch (Exception e) {
                throw new AuraRuntimeException(e);
            }
            return config;
        }
    }

    private static final long serialVersionUID = -4972842636058759316L;
    private final ComponentConfigProvider configProvider;
    private final StaticComponentConfigProvider staticConfigProvider;
    private final ComponentDescriptorProvider descriptorProvider;

    protected JavaProviderDef(Builder builder) throws QuickFixException {
        super(builder);

        ComponentConfigProvider configProv = null;
        StaticComponentConfigProvider staticConfigProv = null;
        ComponentDescriptorProvider descriptorProv = null;

        List<Class<? extends Provider>> interfaces = AuraUtil.findInterfaces(builder.providerClass, Provider.class);
        if (!interfaces.isEmpty()) {
            try {
                for (Class<? extends Provider> theIfc : interfaces) {
                    if (ComponentConfigProvider.class.isAssignableFrom(theIfc)) {
                        configProv = (ComponentConfigProvider) builder.providerClass.newInstance();
                    } else if (ComponentDescriptorProvider.class.isAssignableFrom(theIfc)) {
                        descriptorProv = (ComponentDescriptorProvider) builder.providerClass.newInstance();
                    }

                    if (StaticComponentConfigProvider.class.isAssignableFrom(theIfc)) {
                        staticConfigProv = (StaticComponentConfigProvider) builder.providerClass.newInstance();
                    }
                }
            } catch (InstantiationException ie) {
                throw new InvalidDefinitionException("Cannot instantiate " + builder.providerClass.getName(), location);
            } catch (IllegalAccessException iae) {
                throw new InvalidDefinitionException("Constructor is inaccessible for "
                        + builder.providerClass.getName(), location);
            }
        } else {
            //
            // Compatibility mode.
            // FIXME: this code path should die W-1190554
            //
            Method configMeth = null;
            Method descriptorMeth = null;
            Method attributeMeth = null;
            try {
                Method provideMeth = builder.providerClass.getMethod("provide");
                Class<?> returnType = provideMeth.getReturnType();

                if (Modifier.isStatic(provideMeth.getModifiers())) {
                    if (ComponentConfig.class.isAssignableFrom(returnType)) {
                        configMeth = provideMeth;
                    } else if (DefDescriptor.class.isAssignableFrom(returnType)) {
                        descriptorMeth = provideMeth;
                    }
                }
            } catch (NoSuchMethodException e) {
                // That's ok.
            } catch (Exception e) {
                throw new AuraRuntimeException(e);
            }
            try {
                attributeMeth = builder.providerClass.getMethod("provideAttributes");
                if (!Modifier.isStatic(attributeMeth.getModifiers())) {
                    attributeMeth = null;
                }
            } catch (NoSuchMethodException e) {
                // That's ok.
            } catch (Exception e) {
                throw new AuraRuntimeException(e);
            }
            if (configMeth != null) {
                configProv = new ConfigMethodAdaptor(configMeth);
            } else if (descriptorMeth != null) {
                configProv = new DualMethodAdaptor(descriptorMeth, attributeMeth);
            }
            //
            // End of compatibility mode.
            // FIXME: this code path should die W-1190554
            //
        }
        this.configProvider = configProv;
        this.descriptorProvider = descriptorProv;
        this.staticConfigProvider = staticConfigProv;

        // FIXME!!! W-1191791
        if (configProvider == null && descriptorProvider == null) {
            throw new InvalidDefinitionException("@Provider must have a provider interface.", location);
        }
    }

    /**
     * Validate our definition.
     * 
     * This validation ensures that we have a provider method to get either a
     * descriptor (simple case) or a config (complex case). It also refuses to
     * allow a method by the name of provideAttributes.
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
    }

    @Override
    public ComponentConfig provide(DefDescriptor<? extends RootDefinition> intfDescriptor) {
        ComponentConfig config = null;
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        try {
            if (configProvider != null) {
                config = configProvider.provide();
                loggingService.incrementNum("JavaCallCount");
            } else if (descriptorProvider != null) {
                config = new ComponentConfig();
                config.setDescriptor(descriptorProvider.provide());
                loggingService.incrementNum("JavaCallCount");
            }
        } catch (Exception e) {
            AuraExceptionUtil.wrapExecutionException(e, this.location);
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
            config = staticConfigProvider.provide(ref);
            loggingService.incrementNum("JavaCallCount");
        } catch (Exception e) {
            AuraExceptionUtil.wrapExecutionException(e, this.location);
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

    public static class Builder extends DefinitionImpl.BuilderImpl<ProviderDef> {

        public Builder() {
            super(ProviderDef.class);
        }

        private Class<?> providerClass;

        public Builder setProviderClass(Class<?> c) {
            this.providerClass = c;
            return this;
        }

        @Override
        public JavaProviderDef build() throws QuickFixException {
            return new JavaProviderDef(this);
        }
    }
}
