/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.javascript.parser.handler.mock;

import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Map;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.instance.Model;
import org.auraframework.system.Source;
import org.auraframework.test.mock.DelegatingStubHandler;
import org.auraframework.test.mock.Invocation;
import org.auraframework.test.mock.MockModel;
import org.auraframework.test.mock.Stub;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 * Parse JSTEST mock Models.
 */
public class JavascriptMockModelHandler extends JavascriptMockHandler<ModelDef> {
    private DefDescriptor<ModelDef> modelDefDescriptor = null;

    public JavascriptMockModelHandler(DefDescriptor<TestSuiteDef> descriptor, Source<?> source,
            DefDescriptor<? extends BaseComponentDef> targetDescriptor, Map<String, Object> map) {
        super(descriptor, source, targetDescriptor, map);
    }

    @Override
    protected ModelDef createDefinition(Map<String, Object> map) throws QuickFixException {
        ModelDef baseDef = getBaseDefinition((String) map.get("descriptor"), ModelDef.class);
        modelDefDescriptor = baseDef.getDescriptor();

        List<Stub<?>> stubs = getStubs(map.get("stubs"));

        return (ModelDef) Proxy.newProxyInstance(this.getClass().getClassLoader(), new Class<?>[] { ModelDef.class },
                new DelegatingStubHandler(baseDef, stubs));
    }

    @SuppressWarnings("unchecked")
    @Override
    protected <T> T getValue(Object object, Class<T> retClass) throws QuickFixException {
        if (object != null && Model.class.equals(retClass)) {
            if (!(object instanceof Map)) {
                throw new InvalidDefinitionException("Mock Model expects a map of property names to Answers.", getLocation());
            }
            Map<String, Object> properties = Maps.newHashMap();
            Map<?, ?> propMap = (Map<?, ?>) object;
            for (Object key : propMap.keySet()) {
                properties.put((String) key, getAnswer(propMap.get(key), Object.class));
            }
            return (T) new MockModel(modelDefDescriptor, properties);
        } else {
            return super.getValue(object, retClass);
        }
    }

    @Override
    protected ModelDef getDefaultBaseDefinition() throws QuickFixException {
        return getTargetDescriptor().getDef().getModelDef();
    }

    @Override
    protected Invocation getDefaultInvocation() throws QuickFixException {
        return new Invocation("newInstance", null, Model.class);
    }

}
