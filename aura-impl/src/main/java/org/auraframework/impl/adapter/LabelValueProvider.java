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
package org.auraframework.impl.adapter;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.AuraTextUtil;

/**
 * Value provider for $Label
 */
public class LabelValueProvider implements GlobalValueProvider {

    private final Map<String, Map<String, String>> labels;

    private final LocalizationAdapter localizationAdapter;
    private final DefinitionService definitionService;

    public LabelValueProvider(LocalizationAdapter localizationAdapter, DefinitionService definitionService) {
        this.localizationAdapter = localizationAdapter;
        this.definitionService = definitionService;

        this.labels = new HashMap<>();
    }

    @Override
    public Object getValue(PropertyReference expr) {
        List<String> parts = expr.getList();
        String section = parts.get(0);
        String param = parts.get(1);
        Map<String, String> m = this.labels.get(section);
        if (m == null) {
            m = new HashMap<>();
            this.labels.put(section, m);
        }

        String ret = m.get(param);
        if (ret == null) {
            String label = localizationAdapter.getLabel(section, param);
            // people escape stuff like &copy; in the labels, aura doesn't need that.
            ret = AuraTextUtil.unescapeOutput(label, false);
            m.put(param, ret);
        }
        return ret;
    }

    @Override
    public ValueProviderType getValueProviderKey() {
        return AuraValueProviderType.LABEL;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return definitionService.getDefDescriptor("String", TypeDef.class);
    }

    @Override
    public void validate(PropertyReference expr) throws InvalidExpressionException {
        if (expr.size() != 2) {
            throw new InvalidExpressionException("Labels should have a section and a name: " + expr, expr.getLocation());
        }
        List<String> parts = expr.getList();
        String section = parts.get(0);
        String param = parts.get(1);
        if (!localizationAdapter.labelExists(section, param)) {
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

    @Override
    public void loadValues(Set<PropertyReference> keys) {
        if (keys == null) {
            return;
        }

        Map<String, Set<String>> uncachedLabels = new HashMap<>();
        for (PropertyReference key : keys) {
            if (key.size() != 2) {
                continue;
            }

            List<String> parts = key.getList();
            String section = parts.get(0);
            String name = parts.get(1);

            // If section doesn't exist in cache, adding key to uncached labels and continue
            Map<String, String> labels = this.labels.get(section);
            if (labels == null) {
                labels = new HashMap<>();
                this.addLabelKeyToMap(uncachedLabels, section, name);
                continue;
            }

            if (!labels.containsKey(name)) {
                this.addLabelKeyToMap(uncachedLabels, section, name);
            }
        }

        if (uncachedLabels.isEmpty()) {
            return;
        }

        Map<String, Map<String, String>> labels = this.localizationAdapter.getLabels(uncachedLabels);

        for (Map.Entry<String, Map<String, String>> entry : labels.entrySet()) {
            String section = entry.getKey();
            for (Map.Entry<String, String> nameToValue : entry.getValue().entrySet()) {
                String name = nameToValue.getKey();
                String label = nameToValue.getValue();
                // people escape stuff like &copy; in the labels, aura doesn't need that.
                label = AuraTextUtil.unescapeOutput(label, false);

                this.addLabelToMap(this.labels, section, name, label);
            }
        }

    }

    private void addLabelKeyToMap(Map<String, Set<String>> map, String section, String name) {
        Set<String> names = map.get(section);
        if (names == null) {
            names = new HashSet<>();
            map.put(section, names);
        }
        names.add(name);
    }

    private void addLabelToMap(Map<String, Map<String, String>> map, String section, String name, String label) {
        Map<String, String> labels = map.get(section);
        if (labels == null) {
            labels = new HashMap<>();
            map.put(section, labels);
        }
        labels.put(name, label);
    }

}
