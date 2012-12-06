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
package org.auraframework.impl.java.model;

import java.util.List;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.java.BaseJavaDefFactory;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.*;
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
    protected DefBuilder<?, ? extends ModelDef> getBuilder(DefDescriptor<ModelDef> descriptor)
            throws QuickFixException {
        Class<?> c = getClazz(descriptor);
        if (c == null) {
            return null;
        }
        if(!c.isAnnotationPresent(Model.class)){
            throw new InvalidDefinitionException(String.format("@Model annotation is required on all Models.  Not found on %s", descriptor), new Location(descriptor.getName(), 0));
        }

        JavaModelDef.Builder builder = new JavaModelDef.Builder();
        builder.setDescriptor(descriptor);
        builder.setLocation(descriptor.getName(), 0);
        builder.setModelClass(c);
        return builder;
    }
}
