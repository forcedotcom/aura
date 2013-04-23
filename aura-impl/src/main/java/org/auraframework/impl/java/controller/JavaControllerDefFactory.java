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
package org.auraframework.impl.java.controller;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.impl.java.BaseJavaDefFactory;
import org.auraframework.impl.java.model.JavaValueDef;
import org.auraframework.impl.java.type.JavaTypeDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.DefFactory;
import org.auraframework.system.Location;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * A {@link DefFactory} for Java controllers.
 */
public class JavaControllerDefFactory extends BaseJavaDefFactory<ControllerDef> {

    public JavaControllerDefFactory() {
        this(null);
    }

    public JavaControllerDefFactory(List<SourceLoader> sourceLoaders) {
        super(sourceLoaders);
    }

    @Override
    protected DefBuilder<?, ? extends ControllerDef> getBuilder(DefDescriptor<ControllerDef> descriptor)
            throws QuickFixException {
        JavaControllerDef.Builder builder = new JavaControllerDef.Builder();
        builder.setDescriptor(descriptor);

        Class<?> c = getClazz(descriptor);
        if (c == null) {
            return null;
        }
        builder.setControllerClass(c);
        // FIXME = "we need an md5";
        builder.setLocation(c.getCanonicalName(), -1);
        if (!c.isAnnotationPresent(Controller.class)) {
            throw new InvalidDefinitionException(String.format(
                    "@Controller annotation is required on all Controllers.  Not found on %s", descriptor),
                    builder.getLocation());
        }

        builder.setActionMap(createActions(c, builder.getDescriptor()));
        return builder;
    }

    private static String formatType(Type t) {
        String result = JavaTypeDef.getClass(t).getName();

        if (t instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType) t;
            if (pt.getActualTypeArguments().length > 0) {
                result += "<";
                boolean first = true;
                for (Type tp : pt.getActualTypeArguments()) {
                    if (!first) {
                        result += ",";
                    }
                    first = false;
                    result += formatType(tp); // recurse if nested parameterized
                }
                result += ">";
            }
        }
        return result;
    }

    /**
     * Add a single method as an action.
     * 
     * @param method the method for which we want to create an action.
     * @throws QuickFixException if the method is invalid for some reason.
     */
    private static JavaActionDef makeActionDef(Method method, Class<?> controllerClass,
            DefDescriptor<ControllerDef> controllerDesc) throws QuickFixException {

        JavaActionDef.Builder actionBuilder = new JavaActionDef.Builder();
        int modifiers = method.getModifiers();
        String name = method.getName();
        Class<?>[] paramTypes = method.getParameterTypes();
        List<ValueDef> params = Lists.newArrayList();
        Annotation[][] annotations = method.getParameterAnnotations();

        if (!Modifier.isPublic(modifiers) || !Modifier.isStatic(modifiers)) {
            // We used to just ignore this, but it is really bad, as someone
            // marked an invalid routine
            // as AuraEnabled
            throw new InvalidDefinitionException("Actions must be public static methods", new Location(
                    controllerClass.getName() + "." + name, 0));
        }
        actionBuilder.setDescriptor(SubDefDescriptorImpl.getInstance(name, controllerDesc, ActionDef.class));
        actionBuilder.setMethod(method);
        actionBuilder.setReturnTypeDescriptor(DefDescriptorImpl.getInstance("java://"
                + method.getReturnType().getName(), TypeDef.class));
        actionBuilder.setJavaParams(method.getParameterTypes());
        Type[] genParams = method.getGenericParameterTypes();

        for (int i = 0; i < paramTypes.length; i++) {
            boolean found = false;
            for (Annotation annotation : annotations[i]) {
                if (annotation instanceof Key) {
                    found = true;
                    String qn = "java://" + formatType(genParams[i]);
                    DefDescriptor<TypeDef> typeDefDesc = DefDescriptorImpl.getInstance(qn, TypeDef.class);

                    // FIXME = "we need an md5";
                    ValueDef valueDef = new JavaValueDef(((Key) annotation).value(), typeDefDesc, new Location(
                            controllerClass.getName() + "." + name, 0));
                    params.add(valueDef);
                }
            }
            if (!found) {
                throw new InvalidDefinitionException("@Key annotation is required on all action parameters",
                        new Location(controllerClass.getName() + "." + name, 0));
            }
        }
        actionBuilder.setParams(params);
        return actionBuilder.build();
    }

    /**
     * Create actions for all aura enabled actions on a class.
     * 
     * Note that this function will not look at any method that is not public.
     * If we want to check for @AuraEnabled methods that are marked non-public
     * we would need to walk every method in the heirarchy, checking for that
     * case. It would really just be for validation.
     * 
     * @param controllerClass the class that contains our action functions.
     * @param controllerDesc a descriptor for the class.
     */
    public static Map<String, JavaActionDef> createActions(Class<?> controllerClass,
            DefDescriptor<ControllerDef> controllerDesc) throws QuickFixException {
        Map<String, JavaActionDef> actions = Maps.newTreeMap();
        for (Method method : controllerClass.getMethods()) {
            if (method.isAnnotationPresent(AuraEnabled.class)) {
                JavaActionDef action = makeActionDef(method, controllerClass, controllerDesc);

                if (action != null) {
                    // this line disallows action overloading. dunno if we care.
                    if (actions.containsKey(action.getName())) {
                        throw new InvalidDefinitionException("Duplicate action " + action.getName(), new Location(
                                controllerClass.getName(), 0));
                    }
                    actions.put(action.getName(), action);
                }
            }
        }
        return actions;
    }
}
