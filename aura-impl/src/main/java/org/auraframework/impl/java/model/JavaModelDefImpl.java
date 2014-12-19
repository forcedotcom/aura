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

import java.io.IOException;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.auraframework.Aura;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.JavaModelDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;

import org.auraframework.impl.adapter.BeanAdapterImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Model;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Type;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * JavaModelDef describes a single java model.
 * 
 * The framework imposes a two stage construction/validation framework onto
 */
public class JavaModelDefImpl extends DefinitionImpl<ModelDef> implements JavaModelDef {
    public JavaModelDefImpl(Builder builder) {
        super(builder);
        this.modelClass = builder.modelClass;
        this.memberMap = AuraUtil.immutableMap(builder.memberMap);
        this.useAdapter = builder.useAdapter;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (this.useAdapter) {
            Aura.getBeanAdapter().validateModelBean(this);
        } else {
            BeanAdapterImpl.validateConstructor(this.modelClass);
        }
    }

    /**
     * Add our dependencies to the set.
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        // FIXME: put all of our method dependencies in here...
    }


    /**
     * is this model meant to be instantiated by the bean service.
     */
    public boolean isUseAdapter() {
        return useAdapter;
    }

    /**
     * protected method used by the model itself to get the type
     */
    @Override
    public Class<?> getJavaType() {
        return this.modelClass;
    }

    protected Collection<JavaValueDef> getAllMembers() {
        return memberMap.values();
    }

    @Override
    public boolean hasMembers() {
        return !memberMap.isEmpty();
    }

    @Override
    public ValueDef getMemberByName(String name) {
        return memberMap.get(name);
    }

    @Override
    public TypeDef getType(String s) throws QuickFixException {
        return getMemberByName(s).getType();
    }

    @Override
    public Model newInstance() {
        return new JavaModel(this);
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("members", memberMap.values());
        json.writeMapEnd();
    }

    /**
     * Get a type descriptor for a method return type.
     */
    private static DefDescriptor<TypeDef> getReturnTypeDescriptor(Method method) throws QuickFixException {
        int modifiers = method.getModifiers();

        if (!Modifier.isPublic(modifiers) || Modifier.isStatic(modifiers) || method.getParameterTypes().length > 0) {
            throw new InvalidDefinitionException(String.format("@AuraEnabled annotation found on invalid method %s",
                    method.getName()), new Location("java://" + method.getDeclaringClass().getCanonicalName(), 0));
        }
        Type type = method.getAnnotation(Type.class);
        if (type == null) {
            //
            // FIXME: need better checks here, including doing things like
            // List<Type>, arrays also need to be handled here.
            //
            if (Void.TYPE.equals(method.getGenericReturnType())) {
                throw new InvalidDefinitionException(String.format("@AuraEnabled annotation found on void method %s",
                        method.getName()), new Location("java://" + method.getDeclaringClass().getCanonicalName(), 0));
            }
            return DefDescriptorImpl.getInstance("java://" + method.getReturnType().getName(), TypeDef.class);
        } else {
            return DefDescriptorImpl.getInstance(type.value(), TypeDef.class);
        }
    }
    
    public static class Builder extends DefinitionImpl.BuilderImpl<ModelDef> {

        public Builder() {
            super(ModelDef.class);
        }

        private Class<?> modelClass;
        private Map<String, JavaValueDef> memberMap;
        private boolean useAdapter;

        public Builder setModelClass(Class<?> c) {
            this.modelClass = c;
            return this;
        }

        protected void addMethod(Method method) throws QuickFixException {
            String name = JavaValueDef.getMemberName(method.getName());
            DefDescriptor<TypeDef> typeDescriptor = getReturnTypeDescriptor(method);

            JavaValueDef member = new JavaValueDef(name, method, typeDescriptor,
                    new Location(this.modelClass.getName() + "." + name, 0));
            this.memberMap.put(name, member);
        }

        public void setUseAdapter(boolean useAdapter) {
            this.useAdapter = useAdapter;
        }
        
        @Override
        public JavaModelDefImpl build() {
            this.memberMap = new TreeMap<String, JavaValueDef>();
            for (Method method : this.modelClass.getMethods()) {
                if (method.getAnnotation(AuraEnabled.class) != null) {
                    try {
                        addMethod(method);
                    } catch (QuickFixException e) {
                        setParseError(e);
                    }
                }
            }

            // FIXME: check for init.

            return new JavaModelDefImpl(this);
        }
    }

    private static final long serialVersionUID = -1808570833698749554L;
    private final Class<?> modelClass;
    private final Map<String, JavaValueDef> memberMap;
    private final boolean useAdapter;
}
