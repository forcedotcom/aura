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
package org.auraframework.impl;

import java.util.Map;

import org.auraframework.adapter.ContextAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.context.AuraContextImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.util.json.JsonSerializationContext;

/**
 */
public class ContextAdapterImpl implements ContextAdapter {

    private static ThreadLocal<AuraContext> currentContext = new ThreadLocal<AuraContext>();

    @Override
    public AuraContext establish(Mode mode, MasterDefRegistry masterRegistry, Map<DefType, String> defaultPrefixes,
            Format format, Access access, JsonSerializationContext jsonContext,
            Map<ValueProviderType, GlobalValueProvider> globalProviders,
            DefDescriptor<? extends BaseComponentDef> appDesc) {
        AuraContext context = new AuraContextImpl(mode, masterRegistry, defaultPrefixes, format, access, jsonContext,
                globalProviders, appDesc);
        currentContext.set(context);
        return context;
    }

    @Override
    public AuraContext getCurrentContext() {
        return currentContext.get();
    }

    @Override
    public boolean isEstablished() {
        return currentContext.get() != null;
    }

    @Override
    public void release() {
        currentContext.set(null);
    }

}
