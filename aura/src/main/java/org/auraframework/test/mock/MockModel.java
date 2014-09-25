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
package org.auraframework.test.mock;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.Model;
import org.auraframework.instance.ValueProvider;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.collect.Maps;

/**
 * A simple Model used when mocking ModelDef instantiations.
 */
public class MockModel implements Model {
    private final DefDescriptor<ModelDef> descriptor;
    private final Map<String, Object> properties;

    public MockModel(DefDescriptor<ModelDef> modelDefDescriptor, Map<String, Object> properties) {
        this.descriptor = modelDefDescriptor;
        this.properties = (properties != null ? properties : Maps.<String,Object>newHashMap());
    }

    public Map<String,Object> getProperties() {
        return properties;
    }
    
    @Override
    public Object getValue(PropertyReference key) throws QuickFixException {
        Object ret = getValue(properties, key, descriptor.getDef());
        if (ret instanceof Answer) {
            try {
                ret = ((Answer<?>)ret).answer();
            } catch (Throwable e) {
                if (e instanceof QuickFixException) {
                    throw (QuickFixException)e;
                } else {
                    throw new AuraRuntimeException(e);
                }
            }
        }
        return ret;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        for (Entry<String, Object> entry : properties.entrySet()) {
            Object value = entry.getValue();
            if (value instanceof Answer) {
                try {
                    value = ((Answer<?>)value).answer();
                } catch (Throwable e) {
                    if (e instanceof IOException) {
                        throw (IOException)e;
                    } else {
                        throw new AuraRuntimeException(e);
                    }
                }
            }
            json.writeMapEntry(entry.getKey(), value);
        }
        json.writeMapEnd();
    }

    @Override
    public DefDescriptor<ModelDef> getDescriptor() {
        return descriptor;
    }    

    @Override
    public String getPath() {
        return "mock";
    }

    /**
     * Get a value.
     * 
     * Copied from JavaModel, and, well, still a stupid implementation.
     *
     * This method is a rather painful departure from aura best practices, as it
     * is not really in a definition. This should probably be fixed, and the
     * exceptions cleaned up.
     * 
     * @param root The object from which we want to extract the property
     * @param key the key for the property.
     * @param def the model definition.
     */
    private static Object getValue(Object root, PropertyReference key, ModelDef def) throws QuickFixException {
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
                        throw new AuraRuntimeException(nfe);
                    }
                    ret = ((List<?>) root).get(i);
                }
            } else {
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
            }
            if (stem != null) {
                if (def != null) {
                    ValueProvider vp;
                    TypeDef typeDef = def.getType(part);
                    vp = (ret instanceof ValueProvider) ? (ValueProvider) ret : (ValueProvider) typeDef.wrap(ret);
                    ret = vp.getValue(stem);
                } else {
                    getValue(ret, stem, def);
                }
            }
        } catch (AuraRuntimeException lre) {
            throw lre;
        } catch (Exception e) {
            throw makeException(e.getMessage(), e, def);
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

