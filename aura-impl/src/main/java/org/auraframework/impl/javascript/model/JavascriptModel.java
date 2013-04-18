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
package org.auraframework.impl.javascript.model;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.Map.Entry;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.instance.Model;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class JavascriptModel implements Model {

    private Map<String, Object> bean = Maps.newHashMap();

    private final JavascriptModelDef modelDef;

    public JavascriptModel(JavascriptModelDef modelDef) {
        this.modelDef = modelDef;
        for (JavascriptValueDef member : this.modelDef.getAllMembers()) {
            bean.put(member.getName(), clone(member.getDefaultValue()));
        }
    }

    @SuppressWarnings("unchecked")
    private Object clone(Object val) {
        if (val == null || val instanceof Map) {
            return clone((Map<String, Object>) val);
        } else if (val instanceof List) {
            // Array
            return clone((List<Object>) val);
        } else if (val instanceof String) {
            // String
            return val;
        } else if (val instanceof Boolean) {
            // Boolean
            return ((Boolean) val).booleanValue();
        } else if (val instanceof Number) {
            // Number
            return new BigDecimal(val.toString());
        }
        throw new AuraRuntimeException("Unexpected type.");
    }

    private Map<String, Object> clone(Map<String, Object> val) {
        Map<String, Object> ret = Maps.newHashMap();
        for (Entry<String, Object> entry : val.entrySet()) {
            ret.put(entry.getKey(), clone(entry.getValue()));
        }
        return ret;
    }

    private List<Object> clone(List<Object> val) {
        List<Object> ret = Lists.newArrayList();

        for (Object obj : val) {
            ret.add(clone(obj));
        }
        return ret;
    }

    @Override
    public Object getValue(PropertyReference key) throws QuickFixException {
        return JavaModel.getValue(bean, key, this.modelDef);
    }

    @Override
    public void serialize(Json json) throws IOException {
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("javascript");

        try {
            json.writeMap(bean);
        } finally {
            loggingService.stopTimer("javascript");
            loggingService.startTimer(LoggingService.TIMER_AURA);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
        }
    }

    @Override
    public DefDescriptor<ModelDef> getDescriptor() {
        return modelDef.getDescriptor();
    }

}
