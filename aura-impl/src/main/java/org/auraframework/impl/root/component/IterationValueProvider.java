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
/**
 */
package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.Map;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Model;
import org.auraframework.instance.ValueProvider;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * TODO: make public
 * 
 * 
 * @since 0.0.234
 */
public class IterationValueProvider<D extends BaseComponentDef, I extends BaseComponent<D, I>> implements
        BaseComponent<D, I> {

    private final I attributeValueProvider;
    private final Map<String, Object> additionalValueProviders;

    public IterationValueProvider(I attributeValueProvider, Map<String, Object> additionalValueProviders) {
        this.attributeValueProvider = attributeValueProvider;
        this.additionalValueProviders = additionalValueProviders;
    }

    @Override
    public DefDescriptor<D> getDescriptor() {
        return attributeValueProvider.getDescriptor();
    }

    @Override
    public void serialize(Json json) throws IOException {
        attributeValueProvider.serialize(json);
    }

    @Override
    public Object getValue(PropertyReference key) throws QuickFixException {
        String root = key.getRoot();
        Object o = additionalValueProviders.get(root);
        if (o != null) {
            PropertyReference stem = key.getStem();
            if (stem != null) {
                if (o instanceof ValueProvider) {
                    return ((ValueProvider) o).getValue(stem);
                } else {
                    return JavaModel.getValue(o, stem, null);
                }
            } else {
                return o;
            }
        }
        return attributeValueProvider.getValue(key);
    }

    @Override
    public String getGlobalId() {
        return attributeValueProvider.getGlobalId();
    }

    @Override
    public String getLocalId() {
        return attributeValueProvider.getLocalId();
    }

    @Override
    public AttributeSet getAttributes() {
        return attributeValueProvider.getAttributes();
    }

    @Override
    public void index(Component component) {
        attributeValueProvider.index(component);
    }

    @Override
    public I getSuper() {
        return attributeValueProvider.getSuper();
    }

    @Override
    public boolean hasLocalDependencies() {
        return attributeValueProvider.hasLocalDependencies();
    }

    @Override
    public Model getModel() {
        return attributeValueProvider.getModel();
    }

}
