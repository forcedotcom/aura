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
package org.auraframework.impl.adapter;

import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Maps;

/**
 * Value provider for $Label
 */
public class LabelValueProvider implements GlobalValueProvider {

    // MapValueProvider...
    private final Map<String, Map<String, String>> labels;

    public LabelValueProvider() {
        labels = Maps.newHashMap();
    }

    @Override
    public Object getValue(PropertyReference expr) {
        List<String> parts = expr.getList();
        String section = parts.get(0);
        String param = parts.get(1);
        Map<String, String> m = labels.get(section);
        if (m == null) {
            m = new HashMap<String, String>();
            labels.put(section, m);
        }
        String ret = m.get(param);
        if (ret == null) {
            String label = Aura.getLocalizationAdapter().getLabel(section, param);
            // people escape stuff like &copy; in the labels, aura doesn't need that.
            ret = AuraTextUtil.unescapeOutput(label, false);
            m.put(param, ret);
        }
        return ret;
    }

    @Override
    public ValueProviderType getValueProviderKey() {
        return ValueProviderType.LABEL;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return DefDescriptorImpl.getInstance("String", TypeDef.class);
    }

    @Override
    public void validate(PropertyReference expr) throws InvalidExpressionException {
        if (expr.size() != 2) {
            throw new InvalidExpressionException("Labels should have a section and a name: " + expr, expr.getLocation());
        }
        List<String> parts = expr.getList();
        String section = parts.get(0);
        String param = parts.get(1);
        if (!Aura.getLocalizationAdapter().labelExists(section, param)) {
            throw new InvalidExpressionException("No label found for " + expr, expr.getLocation());
        }
    }

    @Override
    public boolean isEmpty() {
        return labels.isEmpty();
    }

    @Override
    public Map<String, ?> getData() {
        return labels;
    }

}
