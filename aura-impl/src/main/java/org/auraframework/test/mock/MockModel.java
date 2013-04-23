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
import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.instance.Model;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
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
        Object ret = JavaModel.getValue(properties, key, descriptor.getDef());
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
}

