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

import java.util.List;
import java.util.Map;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

/**
 * An instance of an array of ComponentDefRefs along with the value provider they should be evaluated against.
 *
 * @since 0.22
 */
public class ComponentDefRefArray {
    private final List<ComponentDefRef> cdrs;
    private final BaseComponent<?, ?> vp;

    public ComponentDefRefArray(List<ComponentDefRef> cdrs, BaseComponent<?, ?> vp) {
        this.cdrs = cdrs;
        this.vp = vp;
    }

    public List<ComponentDefRef> getList() {
        return this.cdrs;
    }

    public List<Component> newInstance() throws QuickFixException {
        return newInstance(null);
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    public List<Component> newInstance(Map<String, Object> extraProviders) throws QuickFixException {
        List<Component> components = Lists.newArrayListWithExpectedSize(cdrs.size());
        BaseComponent<?, ?> valueProvider = this.vp;
        if (extraProviders != null) {
            // TODO: rename this thing
            valueProvider = new IterationValueProvider(vp, extraProviders);
        }
        for (ComponentDefRef cdr : this.cdrs) {
            // only foreach returns a list, once that is gone get rid of get(0)
            components.add(cdr.newInstance(valueProvider).get(0));
        }
        return components;
    }
}
