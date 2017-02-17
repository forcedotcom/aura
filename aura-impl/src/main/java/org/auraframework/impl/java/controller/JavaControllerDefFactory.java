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

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.java.JavaSourceImpl;
import org.auraframework.impl.java.model.JavaValueDef;
import org.auraframework.impl.java.type.JavaTypeDef;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.BackgroundAction;
import org.auraframework.system.Annotations.CabooseAction;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.DefFactory;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * A {@link DefFactory} for Java controllers.
 */
@ServiceComponent
public class JavaControllerDefFactory implements DefinitionFactory<JavaSourceImpl<ControllerDef>, ControllerDef> {

    @Inject
    private DefinitionService definitionService;

    private static String formatType(Type t) {
        Class<?> clazz = JavaTypeDef.getClass(t);
        String result;
       
        if (clazz != null) {
            result = clazz.getName();
        } else {
            result = "Object";
        }

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
                    if (tp == null) {
                        result += "Object";
                    } else {
                        result += formatType(tp); // recurse if nested parameterized
                    }
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
    private JavaActionDef makeActionDef(Method method, Class<?> controllerClass,
                                        DefDescriptor<ControllerDef> controllerDesc) throws QuickFixException {

        JavaActionDef.Builder actionBuilder = new JavaActionDef.Builder();
        String name = method.getName();
        Class<?>[] paramTypes = method.getParameterTypes();
        List<ValueDef> params = Lists.newArrayList();
        List<String> loggableParams = Lists.newArrayList();
        Annotation[][] paramAnnotations = method.getParameterAnnotations();

        actionBuilder.setDescriptor(SubDefDescriptorImpl.getInstance(name, controllerDesc, ActionDef.class));
        actionBuilder.setMethod(method);
        actionBuilder.setReturnTypeDescriptor(definitionService.getDefDescriptor("java://"
                + method.getReturnType().getName(), TypeDef.class));
        actionBuilder.setJavaParams(method.getParameterTypes());
        Type[] genParams = method.getGenericParameterTypes();

        for (int i = 0; i < paramTypes.length; i++) {
            boolean found = false;
            for (Annotation annotation : paramAnnotations[i]) {
                if (annotation instanceof Key) {
                    found = true;
                    String qn = "java://" + formatType(genParams[i]);
                    DefDescriptor<TypeDef> typeDefDesc = definitionService.getDefDescriptor(qn, TypeDef.class);

                    String paramName = ((Key) annotation).value();
                    ValueDef valueDef = new JavaValueDef(paramName, typeDefDesc, new Location(
                            controllerClass.getName() + "." + name, 0));
                    params.add(valueDef);
                    
                    if (((Key)annotation).loggable()) {
                        loggableParams.add(paramName);
                    }
                }
            }
            if (!found) {
                throw new InvalidDefinitionException("@Key annotation is required on all action parameters",
                        new Location(controllerClass.getName() + "." + name, 0));
            }
        }
        actionBuilder.setParams(params);
        actionBuilder.setLoggableParams(loggableParams);
        
        actionBuilder.setBackground(method.isAnnotationPresent(BackgroundAction.class));
        actionBuilder.setCaboose(method.isAnnotationPresent(CabooseAction.class));

        actionBuilder.setAccess(new DefinitionAccessImpl(Access.INTERNAL));

        return actionBuilder.build();
    }

    private static void throwControllerError(String message, Class<?> clazz, Method method) throws QuickFixException {
        throw new InvalidDefinitionException(message + method.getName(),
                new Location(clazz.getCanonicalName(), 0));
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
    public Map<String, JavaActionDef> createActions(Class<?> controllerClass,
                                                    DefDescriptor<ControllerDef> controllerDesc) throws QuickFixException {
        Map<String, JavaActionDef> actions = Maps.newTreeMap();
        for (Method method : controllerClass.getMethods()) {
            if (method.isAnnotationPresent(AuraEnabled.class)) {
                int modifiers = method.getModifiers();

                if (!Modifier.isPublic(modifiers)) {
                    throwControllerError("Invalid non-public action: ", controllerClass, method);
                }

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

    @Override
    public ControllerDef getDefinition(DefDescriptor<ControllerDef> descriptor, JavaSourceImpl<ControllerDef> source) throws QuickFixException {
        JavaControllerDefImpl.Builder builder = new JavaControllerDefImpl.Builder();
        Class<?> clazz = source.getJavaClass();

        builder.setDescriptor(descriptor);
        builder.setControllerClass(clazz);
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        builder.setLocation(clazz.getCanonicalName(), -1);
        if (!Controller.class.isAssignableFrom(clazz)) {
            throw new InvalidDefinitionException(String.format(
                    "%s must implement org.auraframework.ds.servicecomponent.Controller", clazz.toString()),
                    builder.getLocation());
        }
        try {
            builder.setActionMap(createActions(clazz, builder.getDescriptor()));
        } catch (QuickFixException qfe) {
            builder.setParseError(qfe);
        }
        return builder.build();
    }

    public ControllerDef getDef_DONOTUSE(DefDescriptor<ControllerDef> descriptor, Class<?> clazz)
            throws QuickFixException {
        return getDefinition(descriptor, new JavaSourceImpl<>(descriptor, clazz));
    }

    @Override
    public Class<?> getSourceInterface() {
        return JavaSourceImpl.class;
    }

    @Override
    public Class<ControllerDef> getDefinitionClass() {
        return ControllerDef.class;
    }

    @Override
    public String getMimeType() {
        return JavaSourceImpl.JAVA_MIME_TYPE;
    }

    /**
     * @param definitionService the definitionService to set
     */
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }
}
