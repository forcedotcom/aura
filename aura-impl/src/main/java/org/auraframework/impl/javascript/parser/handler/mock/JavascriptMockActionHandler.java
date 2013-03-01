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

import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.instance.Action.State;
import org.auraframework.system.Source;
import org.auraframework.test.mock.Answer;
import org.auraframework.test.mock.DelegatingStubHandler;
import org.auraframework.test.mock.Invocation;
import org.auraframework.test.mock.MockAction;
import org.auraframework.test.mock.Stub;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableList;

/**
 * Parse JSTEST mock Actions.
 */
public class JavascriptMockActionHandler extends JavascriptMockHandler<ControllerDef> {
    private ControllerDef controllerDef;
    private ActionDef actionDef;

    public JavascriptMockActionHandler(DefDescriptor<TestSuiteDef> descriptor, Source<?> source,
            DefDescriptor<? extends BaseComponentDef> targetDescriptor, Map<String, Object> map) {
        super(descriptor, source, targetDescriptor, map);
    }

    @Override
    protected ControllerDef createDefinition(Map<String, Object> map) throws QuickFixException {
        controllerDef = getBaseDefinition((String) map.get("descriptor"), ControllerDef.class);

        List<Stub<?>> stubs = getStubs(map.get("stubs"));

        return (ControllerDef) Proxy.newProxyInstance(this.getClass().getClassLoader(),
                new Class<?>[] { ControllerDef.class }, new DelegatingStubHandler(controllerDef, stubs));
    }

    @Override
    protected ControllerDef getDefaultBaseDefinition() throws QuickFixException {
        for (DefDescriptor<ControllerDef> desc : getTargetDescriptor().getDef().getControllerDefDescriptors()) {
            if ("java".equals(desc.getPrefix())) {
                return desc.getDef();
            }
        }
        throw new InvalidDefinitionException("Unable to locate the server controller", getLocation());
    }

    @Override
    protected Invocation getDefaultInvocation() throws QuickFixException {
        throw new InvalidDefinitionException("A mock action must specify the name of the action", getLocation());
    }

    @Override
    protected Invocation getInvocation(Object object) throws QuickFixException {
        if (object instanceof Map) {
            Map<?, ?> methodMap = (Map<?, ?>) object;
            String name = (String) methodMap.get("name");
            if (name == null) {
                throw new InvalidDefinitionException("A mock action must specify the name of the action", getLocation());
            }
            String typeStr = (String) methodMap.get("type");
            Class<?> type = Object.class;
            if (typeStr != null) {
                try {
                    type = classForSimpleName(typeStr);
                } catch (ClassNotFoundException e) {
                }
            }
            actionDef = controllerDef.getSubDefinition(name);
            return new ActionInvocation("createAction", ImmutableList.of(name), type);
        }
        return super.getInvocation(object);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected <T> Answer<T> getAnswer(Object object, Class<T> retClass) throws QuickFixException {
        if (object instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) object;
            T value = getValue(map.get("value"), retClass);
            String error = (String) map.get("error");
            if (value != null) {
                if (error == null) {
                    return new Returns<T>((T) new MockAction(
                            actionDef.getDescriptor(), State.SUCCESS, value));
                }
            } else {
                if (error != null) {
                    try {
                        new ThrowsExceptionClass<T>(error).answer();
                    } catch (Throwable e) {
                        return new Returns<T>((T) new MockAction(
                                actionDef.getDescriptor(), State.ERROR, null,
                                null, null, ImmutableList.<Object> of(e)));
                    }
                }
            }
        }
        throw new InvalidDefinitionException("Mock answer must specify either 'value' or 'error'", getLocation());
    }

    /**
     * Matches invocations where the first param, action name, is equal.
     */
    public class ActionInvocation extends Invocation {
        public ActionInvocation(String methodName, List<?> parameters, Class<?> returnType) {
            super(methodName, parameters, returnType);
        }

        @Override
        public boolean matches(Method method, Object[] args) {
            List<?> parameters = getParameters();
            return method.getName().equals(getMethodName()) && parameters.get(0).equals(args[0]);
        }
    }
}
