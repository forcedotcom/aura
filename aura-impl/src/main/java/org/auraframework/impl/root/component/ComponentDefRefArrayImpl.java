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
package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ComponentDefRefArray;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;

/**
 * An instance of an array of ComponentDefRefs along with the value provider they should be evaluated against.
 *
 * @since 0.22
 */
public class ComponentDefRefArrayImpl implements JsonSerializable, ComponentDefRefArray {
    private final List<ComponentDefRef> cdrs;
    private final BaseComponent<?, ?> vp;

    public ComponentDefRefArrayImpl(List<ComponentDefRef> cdrs, BaseComponent<?, ?> vp) {
        this.cdrs = cdrs;
        this.vp = vp;
    }

    @Override
    public List<ComponentDefRef> getList() {
        return this.cdrs;
    }

    @Override
    public List<Component> newInstance(BaseComponent<?, ?> fallbackValueProvider) throws QuickFixException {
        return newInstance(fallbackValueProvider, null);
    }

    @Override
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public List<Component> newInstance(BaseComponent<?, ?> fallbackValueProvider, Map<String, Object> extraProviders) throws QuickFixException {
        List<Component> components = Lists.newArrayListWithExpectedSize(cdrs.size());
        BaseComponent<?, ?> valueProvider = this.vp != null ? this.vp : fallbackValueProvider;
        if (extraProviders != null) {
            // TODO: rename this thing
            valueProvider = new IterationValueProvider(valueProvider, extraProviders);
        }
        AuraContext context = Aura.getContextService().getCurrentContext();
        int idx = 0;
        for (ComponentDefRef cdr : this.cdrs) {
            context.getInstanceStack().setAttributeIndex(idx);
            components.add(cdr.newInstance(valueProvider));
            context.getInstanceStack().clearAttributeIndex(idx);
            idx += 1;
        }
        return components;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeArray(cdrs);
    }
}
