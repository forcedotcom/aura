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
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.type.JavaValueProvider;
import org.auraframework.impl.javascript.testsuite.JavascriptMockHandler;
import org.auraframework.instance.InstanceStack;
import org.auraframework.instance.Model;
import org.auraframework.instance.ValueProvider;
import org.auraframework.service.ContextService;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

/**
 * A java model.
 *
 * The model is directly instantiated from the class (unlike controllers
 * which are static).
 */
public class JavaModel implements Model {
    private final Object bean;
    private final JavaModelDefImpl modelDef;
    private final String path;
    private final LoggingService loggingService;

    /**
     * The constructor.
     *
     * @param modelDef the definition for the model.
     */
    public JavaModel(JavaModelDefImpl modelDef, Object bean, ContextService contextService,
            LoggingService loggingService) {
        this.modelDef = modelDef;
        this.loggingService = loggingService;
        InstanceStack iStack = contextService.getCurrentContext().getInstanceStack();
        iStack.pushInstance(this, modelDef.getDescriptor());
        iStack.setAttributeName("m");
        this.path = iStack.getPath();
        this.bean = bean;
        iStack.clearAttributeName("m");
        iStack.popInstance(this);
    }

    @Override
    public DefDescriptor<ModelDef> getDescriptor() {
        return modelDef.getDescriptor();
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        try {
            for (JavaValueDef member : this.modelDef.getAllMembers()) {
                Object value = member.getValueFrom(bean);
                String typeName = null;
                if (value == null) {
                    try {
                        typeName = member.getType().toString();
                    } catch (QuickFixException qfe) {
                        // Uh, swallow this and just treat it as not-a-list, not-a-map.
                        // It probably should never happen, but we don't want to choke for it.
                    }
                }
                json.writeMapEntry(member.getName(), value, typeName);
            }
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
        }
        json.writeMapEnd();
    }

    @Override
    public Object getValue(PropertyReference key) throws QuickFixException {
        return getValue(bean, key, this.modelDef);
    }

    @Override
    public String getPath() {
        return this.path;
    }

    /**
     * Get a value.
     *
     * This method is a rather painful departure from aura best practices, as it
     * is not really in a definition. This should probably be fixed, and the
     * exceptions cleaned up.
     *
     * @param root The object from which we want to extract the property
     * @param key the key for the property.
     * @param def the model definition.
     */
    public static Object getValue(Object root, PropertyReference key, ModelDef def) throws QuickFixException {
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        Object ret = null;
        try {
            String part = key.getRoot();
            PropertyReference stem = key.getStem();
            if (root == null) {
                return null;
            } else if (root instanceof Map) {
                ret = ((Map<?, ?>) root).get(part);
            } else if (root instanceof List) {
                List<?> l = ((List<?>) root);
                // special case for length property
                if ("length".equals(part)) {
                    ret = l.size();
                } else {
                    int i;

                    try {
                        i = Integer.parseInt(part); // NumberFormatException will be caught below
                    } catch (NumberFormatException nfe) {
                        throw makeException(nfe.getMessage(), nfe, def);
                    }
                    if(i >= l.size()) {
                    	return null;
                    }
                    ret = l.get(i);
                }
            } else if(root instanceof JavascriptMockHandler.Returns) {
                try {
                    Object answer = ((JavascriptMockHandler.Returns)root).answer();
                    return getValue(answer, key, def);
                } catch (Throwable e) {
                    // The answer was an exception
                    return e;
                }
            }
            else {
                Method meth = null;
                try {
                    meth = root.getClass().getMethod("get" + AuraTextUtil.initCap(part));
                } catch (NoSuchMethodException e) {
                    try {
                        meth = root.getClass().getMethod("is" + AuraTextUtil.initCap(part));
                    } catch (NoSuchMethodException nme) {
                        throw makeException("no such property: " + part, e, def);
                    }
                }
                try {
                    ret = meth.invoke(root);
                } catch (IllegalAccessException iae) {
                    throw makeException("no such property: " + part, iae, def);
                } catch (InvocationTargetException ite) {
                    throw makeException(ite.getCause().getMessage(), ite.getCause(), def);
                }
                loggingService.incrementNum("JavaCallCount");
            }
            ValueProvider vp;
            if (def != null) {
                TypeDef typeDef = def.getType(part);
                vp = (ret instanceof ValueProvider) ? (ValueProvider) ret : (ValueProvider) typeDef.wrap(ret);
            } else {
                vp = (ret instanceof ValueProvider) ? (ValueProvider) ret : new JavaValueProvider(ret);
            }
            if (stem != null) {
                ret = vp.getValue(stem);
            }
        } catch (AuraRuntimeException lre) {
            throw lre;
        } catch (Exception e) {
            throw makeException(e.getMessage(), e, def);
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }

        return ret;
    }

    private static AuraRuntimeException makeException(String message, Throwable cause, ModelDef def) {
        if (def != null) {
            return new AuraExecutionException(message,def.getLocation(),cause);
        } else {
            return new AuraRuntimeException(message, cause);
        }
    }
}
