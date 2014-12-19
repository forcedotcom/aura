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
package org.auraframework.impl.java.model;

import java.util.List;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.java.BaseJavaDefFactory;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * def factory for the java model
 */
public class JavaModelDefFactory extends BaseJavaDefFactory<ModelDef> {

    public JavaModelDefFactory() {
        this(null);
    }

    public JavaModelDefFactory(List<SourceLoader> sourceLoaders) {
        super(sourceLoaders);
    }

    @Override
    protected DefBuilder<?, ? extends ModelDef> getBuilder(DefDescriptor<ModelDef> descriptor) throws QuickFixException {
        JavaModelDefImpl.Builder builder = new JavaModelDefImpl.Builder();
        Class<?> c = getClazz(descriptor);
        if (c == null) {
            return null;
        }
        builder.setDescriptor(descriptor);
        builder.setLocation(descriptor.getName(), 0);
        builder.setModelClass(c);
        Model ann = findAnnotation(c, Model.class);
        if (ann == null) {
            throw new InvalidDefinitionException(String.format(
                    "@Model annotation is required on all Models.  Not found on %s", descriptor),
                    builder.getLocation());
        }
        builder.setUseAdapter(ann.useAdapter());
        return builder;
    }
}
