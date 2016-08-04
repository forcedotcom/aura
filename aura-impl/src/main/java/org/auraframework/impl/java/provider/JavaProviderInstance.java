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

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDescriptorProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Provider;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.StaticComponentConfigProvider;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.instance.ProviderInstance;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class JavaProviderInstance implements ProviderInstance {

    private final ProviderDef providerDef;
    private final Provider provider;
    private final LoggingService loggingService;

    public JavaProviderInstance(ProviderDef providerDef, Provider provider, LoggingService loggingService) {
        this.providerDef = providerDef;
        this.provider = provider;
        this.loggingService = loggingService;
    }

    @SuppressWarnings("unchecked")
    @Override
    public DefDescriptor<ProviderDef> getDescriptor() {
        return (DefDescriptor<ProviderDef>) providerDef.getDescriptor();
    }

    @Override
    public String getPath() {
        throw new UnsupportedOperationException("JavaProviderInstance does not support getPath() at this time.");
    }

    @Override
    public void serialize(Json json) throws IOException {
        providerDef.serialize(json);
    }

    @Override
    public ComponentConfig provide() throws QuickFixException {
        ComponentConfig config = null;
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        try {
            if (provider instanceof ComponentConfigProvider) {
                config = ((ComponentConfigProvider) provider).provide();
                loggingService.incrementNum("JavaCallCount");
            } else if (provider instanceof ComponentDescriptorProvider) {
                config = new ComponentConfig();
                config.setDescriptor(((ComponentDescriptorProvider) provider).provide());
                loggingService.incrementNum("JavaCallCount");
            }

        } catch (Exception e) {
            throw AuraExceptionUtil.wrapExecutionException(e, this.providerDef.getLocation());
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }

        return config;
    }

    @Override
    public ComponentConfig provide(ComponentDefRefBuilder ref)
            throws QuickFixException {
        ComponentConfig config = null;
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");

        try {
            config = ((StaticComponentConfigProvider) provider).provide(ref);
            loggingService.incrementNum("JavaCallCount");
        } catch (Exception e) {
            throw AuraExceptionUtil.wrapExecutionException(e, this.providerDef.getLocation());
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }

        return config;
    }

}
