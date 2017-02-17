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
package org.auraframework.impl.java.type;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.java.JavaSourceImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.DefinitionFactory;

/**
 * Loads Java types for Aura components.
 */
@ServiceComponent
public class JavaTypeDefFactory implements DefinitionFactory<JavaSourceImpl<TypeDef>, TypeDef> {
    @Override
    public TypeDef getDefinition(DefDescriptor<TypeDef> descriptor, JavaSourceImpl<TypeDef> source) {
        JavaTypeDef.Builder builder;
        Class<?> clazz = source.getJavaClass();

        builder = new JavaTypeDef.Builder();
        builder.setDescriptor(descriptor);
        builder.setLocation(clazz.getCanonicalName(), 0);
        builder.setTypeClass(clazz);
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.GLOBAL));
        return builder.build();
    }

    @Override
    public Class<?> getSourceInterface() {
        return JavaSourceImpl.class;
    }

    @Override
    public Class<TypeDef> getDefinitionClass() {
        return TypeDef.class;
    }

    @Override
    public String getMimeType() {
        return JavaSourceImpl.JAVA_MIME_TYPE;
    }
}
