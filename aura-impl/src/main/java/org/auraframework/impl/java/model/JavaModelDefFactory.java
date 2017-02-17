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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.java.JavaSourceImpl;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * def factory for the java model
 */
@ServiceComponent
public class JavaModelDefFactory implements DefinitionFactory<JavaSourceImpl<ModelDef>, ModelDef> {
    @Override
    public ModelDef getDefinition(DefDescriptor<ModelDef> descriptor, JavaSourceImpl<ModelDef> source) throws QuickFixException {
        JavaModelDefImpl.Builder builder = new JavaModelDefImpl.Builder();
        Class<?> clazz = source.getJavaClass();

        builder.setDescriptor(descriptor);
        builder.setLocation(descriptor.getName(), 0);
        builder.setModelClass(clazz);
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        Model ann = source.findAnnotation(Model.class);
        if (ann == null) {
            throw new InvalidDefinitionException(String.format(
                    "@Model annotation is required on all Models.  Not found on %s", source.getDescriptor()),
                    builder.getLocation());
        }
        return builder.build();
    }

    @Override
    public Class<?> getSourceInterface() {
        return JavaSourceImpl.class;
    }

    @Override
    public Class<ModelDef> getDefinitionClass() {
        return ModelDef.class;
    }

    @Override
    public String getMimeType() {
        return JavaSourceImpl.JAVA_MIME_TYPE;
    }
}
