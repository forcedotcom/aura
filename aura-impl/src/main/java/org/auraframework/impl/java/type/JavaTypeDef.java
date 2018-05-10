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

import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;

import org.auraframework.Aura;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ConverterService;
import org.auraframework.util.json.Json;

/**
 */
public class JavaTypeDef extends DefinitionImpl<TypeDef> implements TypeDef {

    private static final long serialVersionUID = -1650260598462052988L;
    private final Class<?> clazz;
    private final String simpleParamName;

    protected JavaTypeDef(Builder builder) {
        super(builder);
        this.clazz = builder.typeClass;

        simpleParamName = makeSimpleParamName();
    }

    private String makeSimpleParamName() {
        if (descriptor.getNameParameters() == null) {
            return null;
        }

        // remove angle brackets and namespace qualifiers
        String tempParamName = descriptor.getNameParameters().replaceAll("[<>]", "");
        int pos = tempParamName.lastIndexOf('.');
        if (pos != -1) {
            tempParamName = tempParamName.substring(pos + 1);
        }
        return tempParamName;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeString(getName());
    }

    /**
     * @return The Java class wrapped by this Aura TypeDef
     *
     * @param prefix unused
     */
    @Override
    public Object getExternalType(String prefix) {
        if (!"java".equalsIgnoreCase(prefix)) {
            throw new UnsupportedOperationException("We only support java wrappers");
        }
        return clazz;
    }

    @Override
    public String toString() {
        return descriptor.getQualifiedName();
    }

    @Override
    public Object valueOf(Object value) {
        ConverterService converterService = Aura.getConverterService();
        if (descriptor.isParameterized() && simpleParamName != null
                && converterService.hasConverter(ArrayList.class, clazz, simpleParamName)) {
            return converterService.convert(value, clazz, simpleParamName, false);
        }
        return converterService.convert(value, clazz, null, false, true);
    }

    @Override
    public Object wrap(Object o) {
        return new JavaValueProvider(o);
    }

    @Override
    public Object initialize(Object config, BaseComponent<?, ?> valueProvider) {
        if (config != null && config instanceof String && !clazz.isInstance(config)) {
            // TODO: KRIS WE CAN'T PASS NULL HERE. THATS MESSED UP AND WILL FAIL.
            return valueOf(config);
        }
        return config;
    }

    /**
     * Get the underlying class for a type, or null if the type is a variable
     * type. Code in part from Ian Roberton's June 23, 2007 blog post :
     * http://www.artima.com/weblogs/viewpost.jsp?thread=208860
     * 
     * @param type the type
     * @return the underlying class
     */
    public static Class<?> getClass(Type type) {
        if (type instanceof Class) {
            return (Class<?>) type;
        } else if (type instanceof ParameterizedType) {
            return getClass(((ParameterizedType) type).getRawType());
        } else if (type instanceof GenericArrayType) {
            Type componentType = ((GenericArrayType) type).getGenericComponentType();
            Class<?> componentClass = getClass(componentType);
            if (componentClass != null) {
                return Array.newInstance(componentClass, 0).getClass();
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<TypeDef> {

        public Builder() {
            super(TypeDef.class);
        }

        private Class<?> typeClass;

        public Builder setTypeClass(Class<?> c) {
            this.typeClass = c;
            return this;
        }

        @Override
        public JavaTypeDef build() {
            return new JavaTypeDef(this);
        }
    }
}
