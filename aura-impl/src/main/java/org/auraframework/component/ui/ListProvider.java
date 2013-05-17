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
package org.auraframework.component.ui;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 * provider for list.cmp that cludges the items from the dataprovider into the list
 */
@Provider
public class ListProvider implements ComponentConfigProvider {

    @Override
    public ComponentConfig provide() throws QuickFixException {
        BaseComponent<?, ?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();
        ComponentConfig cc = new ComponentConfig();
        Map<String, Object> m = Maps.newHashMapWithExpectedSize(1);
        // so now we're relying on the fact that the data provider's model has items on it, thats fantastic.
        m.put("items", component.getAttributes().getValue(new PropertyReferenceImpl("dataProvider.0.m.items", null)));
        cc.setAttributes(m);
        return cc;
    }

}
